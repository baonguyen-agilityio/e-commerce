import { describe, it, expect, vi, beforeEach } from "vitest";
import { OrderService } from "../order.service";
import { Order, OrderStatus } from "../entities/Order";
import { OrderItem } from "../entities/OrderItem";
import {
    createMockRepository,
    MockRepository,
} from "@/test/mocks/repository.mock";
import { User, UserRole } from "@/modules/user/entities/User";
import { Cart } from "@/modules/cart/entities/Cart";
import { CartItem } from "@/modules/cart/entities/CartItem";
import { Product } from "@/modules/product/entities/Product";
import { IPaymentGateway } from "@/shared/interfaces/IPaymentGateway";
import { IEmailService } from "@/shared/interfaces/IEmailService";
import {
    BadRequestError,
    ForbiddenError,
    NotFoundError,
} from "@/shared/errors";
import { createMockOrder, createMockOrderItem } from "@/test/factories/order.factory";
import { createMockUser } from "@/test/factories/user.factory";
import { createMockCart, createMockCartItem } from "@/test/factories/cart.factory";
import { createMockProduct } from "@/test/factories/product.factory";

describe("OrderService", () => {
    let orderService: OrderService;
    let mockOrderRepository: MockRepository<Order>;
    let mockUserRepository: MockRepository<User>;
    let mockCartRepository: MockRepository<Cart>;
    let mockPaymentGateway: IPaymentGateway;
    let mockEmailService: IEmailService;

    let mockUser: User;
    let mockCart: Cart;
    let mockProduct: Product;
    let mockCartItem: CartItem;

    beforeEach(() => {
        mockOrderRepository = createMockRepository<Order>();
        mockUserRepository = createMockRepository<User>();
        mockCartRepository = createMockRepository<Cart>();

        mockPaymentGateway = {
            processPayment: vi.fn(),
        };

        mockEmailService = {
            sendOrderConfirmation: vi.fn().mockResolvedValue(undefined),
        };

        orderService = new OrderService(
            mockOrderRepository as any,
            mockUserRepository as any,
            mockCartRepository as any,
            mockPaymentGateway,
            mockEmailService
        );

        mockUser = createMockUser({
            id: 1,
            clerkId: "user_123",
            email: "test@example.com",
        });

        mockProduct = createMockProduct({
            id: 1,
            productId: "prod-123",
            name: "Test Product",
            price: 50.00,
            stock: 10,
        });

        mockCartItem = createMockCartItem({
            id: 1,
            cartItemId: "item-123",
            quantity: 2,
            product: mockProduct,
            cart: { id: 1 } as any,
        });

        mockCart = createMockCart({
            id: 1,
            clerkId: "user_123",
            items: [mockCartItem],
        });
    });

    describe("checkoutOrder", () => {
        it("should create order and process payment successfully", async () => {
            const mockOrder = createMockOrder({
                orderId: "order-123",
                user: { id: 1 } as User,
                total: 100.00,
                status: OrderStatus.PAID,
                paymentId: "pi_123",
            });

            mockUserRepository.findOneBy.mockResolvedValue(mockUser);
            mockCartRepository.findOne.mockResolvedValue(mockCart);

            const mockManager: any = {
                findOne: vi.fn()
                    .mockResolvedValueOnce(mockProduct)
                    .mockResolvedValueOnce(mockProduct)
                    .mockResolvedValueOnce(mockOrder),
                create: vi.fn()
                    .mockReturnValueOnce(mockOrder)
                    .mockReturnValue({}),
                save: vi.fn().mockResolvedValue(mockOrder),
                update: vi.fn().mockResolvedValue({}),
                delete: vi.fn().mockResolvedValue({}),
            };
            mockManager.transaction = vi.fn(async (callback) => await callback(mockManager));

            mockOrderRepository.manager = mockManager as any;

            mockPaymentGateway.processPayment = vi.fn().mockResolvedValue({
                success: true,
                paymentId: "pi_123",
            });

            const result = await orderService.checkoutOrder("user_123", "pm_123");

            expect(result.success).toBe(true);
            expect(result.order.status).toBe(OrderStatus.PAID);
            expect(result.order.paymentId).toBe("pi_123");
            expect(mockPaymentGateway.processPayment).toHaveBeenCalledWith({
                amount: 100.00,
                currency: "usd",
                description: expect.stringContaining("Order #"),
                paymentMethodId: "pm_123",
            });
            expect(mockEmailService.sendOrderConfirmation).toHaveBeenCalledWith({
                order: expect.any(Object),
                customer: mockUser,
            });
        });

        it("should throw error if user not found", async () => {
            mockUserRepository.findOneBy.mockResolvedValue(null);

            await expect(
                orderService.checkoutOrder("invalid_user", "pm_123")
            ).rejects.toThrow(NotFoundError);
        });

        it("should throw error if cart is empty", async () => {
            mockUserRepository.findOneBy.mockResolvedValue(mockUser);
            mockCartRepository.findOne.mockResolvedValue({
                ...mockCart,
                items: [],
            });

            await expect(
                orderService.checkoutOrder("user_123", "pm_123")
            ).rejects.toThrow(BadRequestError);
            await expect(
                orderService.checkoutOrder("user_123", "pm_123")
            ).rejects.toThrow("Your cart is currently empty");
        });

        it("should throw error if cart doesn't exist", async () => {
            mockUserRepository.findOneBy.mockResolvedValue(mockUser);
            mockCartRepository.findOne.mockResolvedValue(null);

            await expect(
                orderService.checkoutOrder("user_123", "pm_123")
            ).rejects.toThrow(BadRequestError);
        });

        it("should remove cart item if product out of stock", async () => {
            mockUserRepository.findOneBy.mockResolvedValue(mockUser);
            mockCartRepository.findOne.mockResolvedValue(mockCart);

            const outOfStockProduct = { ...mockProduct, stock: 0 };
            mockOrderRepository.manager.findOne = vi.fn().mockResolvedValue(outOfStockProduct);
            mockOrderRepository.manager.delete = vi.fn().mockResolvedValue({});

            await expect(
                orderService.checkoutOrder("user_123", "pm_123")
            ).rejects.toThrow("out of stock and has been removed");

            expect(mockOrderRepository.manager.delete).toHaveBeenCalledWith(
                CartItem,
                mockCartItem.id
            );
        });

        it("should update cart item if requested quantity exceeds stock", async () => {
            mockUserRepository.findOneBy.mockResolvedValue(mockUser);

            const limitedStockProduct = { ...mockProduct, stock: 1 };
            const cartWithHighQuantity = {
                ...mockCart,
                items: [{
                    ...mockCartItem,
                    quantity: 5,
                }]
            };

            mockCartRepository.findOne.mockResolvedValue(cartWithHighQuantity);
            mockOrderRepository.manager.findOne = vi.fn().mockResolvedValue(limitedStockProduct);
            mockOrderRepository.manager.update = vi.fn().mockResolvedValue({});

            await expect(
                orderService.checkoutOrder("user_123", "pm_123")
            ).rejects.toThrow("Your cart has been updated");

            expect(mockOrderRepository.manager.update).toHaveBeenCalledWith(
                CartItem,
                expect.any(Number),
                { quantity: 1 }
            );
        });

        it("should rollback stock on payment failure", async () => {
            const mockOrder = createMockOrder({
                orderId: "order-123",
                user: { id: 1 } as User,
                total: 100.00,
                status: OrderStatus.PENDING_PAYMENT,
                items: [
                    createMockOrderItem({
                        product: { id: 1 } as Product,
                        quantity: 2,
                    }),
                ],
            });

            mockUserRepository.findOneBy.mockResolvedValue(mockUser);
            mockCartRepository.findOne.mockResolvedValue(mockCart);

            const mockManager: any = {
                findOne: vi.fn()
                    .mockResolvedValueOnce(mockProduct)
                    .mockResolvedValueOnce(mockProduct)
                    .mockResolvedValueOnce(mockOrder),
                create: vi.fn()
                    .mockReturnValueOnce(mockOrder)
                    .mockReturnValue({}),
                save: vi.fn().mockResolvedValue(mockOrder),
                update: vi.fn().mockResolvedValue({}),
                delete: vi.fn().mockResolvedValue({}),
            };
            mockManager.transaction = vi.fn(async (callback) => await callback(mockManager));

            mockOrderRepository.manager = mockManager as any;

            mockPaymentGateway.processPayment = vi.fn().mockResolvedValue({
                success: false,
                error: "Insufficient funds",
            });

            await expect(
                orderService.checkoutOrder("user_123", "pm_123")
            ).rejects.toThrow("Insufficient funds");

            expect(mockManager.update).toHaveBeenCalledWith(
                Product,
                expect.any(Number),
                { stock: expect.any(Function) }
            );
        });

        it("should calculate total correctly for multiple items", async () => {
            const product1 = createMockProduct({ id: 1, price: 25.50 });
            const product2 = createMockProduct({ id: 2, price: 30.25 });

            const cart = createMockCart({
                clerkId: "user_123",
                items: [
                    createMockCartItem({ quantity: 2, product: product1 }),
                    createMockCartItem({ quantity: 3, product: product2 }),
                ],
            });

            mockUserRepository.findOneBy.mockResolvedValue(mockUser);
            mockCartRepository.findOne.mockResolvedValue(cart);

            const mockOrder = createMockOrder({
                total: 141.75,
            });

            const mockManager: any = {
                findOne: vi.fn()
                    .mockResolvedValueOnce(product1)
                    .mockResolvedValueOnce(product2)
                    .mockResolvedValueOnce(product1)
                    .mockResolvedValueOnce(product2)
                    .mockResolvedValueOnce(mockOrder),
                create: vi.fn()
                    .mockReturnValueOnce(mockOrder)
                    .mockReturnValue({}),
                save: vi.fn().mockResolvedValue(mockOrder),
                update: vi.fn().mockResolvedValue({}),
                delete: vi.fn().mockResolvedValue({}),
            };
            mockManager.transaction = vi.fn(async (callback) => await callback(mockManager));

            mockOrderRepository.manager = mockManager as any;

            mockPaymentGateway.processPayment = vi.fn().mockResolvedValue({
                success: true,
                paymentId: "pi_123",
            });

            await orderService.checkoutOrder("user_123", "pm_123");

            expect(mockPaymentGateway.processPayment).toHaveBeenCalledWith(
                expect.objectContaining({
                    amount: 141.75,
                })
            );
        });

        it("should deduct stock after successful payment", async () => {
            const mockOrder = createMockOrder({
                orderId: "order-123",
                user: { id: 1 } as User,
                total: 100.00,
            });

            mockUserRepository.findOneBy.mockResolvedValue(mockUser);
            mockCartRepository.findOne.mockResolvedValue(mockCart);

            const mockManager: any = {
                findOne: vi.fn()
                    .mockResolvedValueOnce(mockProduct)
                    .mockResolvedValueOnce(mockProduct)
                    .mockResolvedValueOnce(mockOrder),
                create: vi.fn()
                    .mockReturnValueOnce(mockOrder)
                    .mockReturnValue({}),
                save: vi.fn().mockResolvedValue(mockOrder),
                update: vi.fn().mockResolvedValue({}),
                delete: vi.fn().mockResolvedValue({}),
            };
            mockManager.transaction = vi.fn(async (callback) => await callback(mockManager));

            mockOrderRepository.manager = mockManager as any;

            mockPaymentGateway.processPayment = vi.fn().mockResolvedValue({
                success: true,
                paymentId: "pi_123",
            });

            await orderService.checkoutOrder("user_123", "pm_123");

            expect(mockManager.update).toHaveBeenCalledWith(
                Product,
                mockProduct.id,
                { stock: expect.any(Function) }
            );
        });

        it("should clear cart after successful payment", async () => {
            const mockOrder = createMockOrder({
                orderId: "order-123",
                user: { id: 1 } as User,
                total: 100.00,
            });

            mockUserRepository.findOneBy.mockResolvedValue(mockUser);
            mockCartRepository.findOne.mockResolvedValue(mockCart);

            const mockManager: any = {
                findOne: vi.fn()
                    .mockResolvedValueOnce(mockProduct)
                    .mockResolvedValueOnce(mockProduct)
                    .mockResolvedValueOnce(mockOrder),
                create: vi.fn()
                    .mockReturnValueOnce(mockOrder)
                    .mockReturnValue({}),
                save: vi.fn().mockResolvedValue(mockOrder),
                update: vi.fn().mockResolvedValue({}),
                delete: vi.fn().mockResolvedValue({}),
            };
            mockManager.transaction = vi.fn(async (callback) => await callback(mockManager));

            mockOrderRepository.manager = mockManager as any;

            mockPaymentGateway.processPayment = vi.fn().mockResolvedValue({
                success: true,
                paymentId: "pi_123",
            });

            await orderService.checkoutOrder("user_123", "pm_123");

            expect(mockManager.delete).toHaveBeenCalledWith(CartItem, {
                cart: { id: mockCart.id },
            });
        });

        it("should not send email on payment failure", async () => {
            const mockOrder = createMockOrder({
                orderId: "order-123",
                items: [createMockOrderItem()],
            });

            mockUserRepository.findOneBy.mockResolvedValue(mockUser);
            mockCartRepository.findOne.mockResolvedValue(mockCart);

            const mockManager: any = {
                findOne: vi.fn()
                    .mockResolvedValueOnce(mockProduct)
                    .mockResolvedValueOnce(mockProduct)
                    .mockResolvedValueOnce(mockOrder),
                create: vi.fn()
                    .mockReturnValueOnce(mockOrder)
                    .mockReturnValue({}),
                save: vi.fn().mockResolvedValue(mockOrder),
                update: vi.fn().mockResolvedValue({}),
                delete: vi.fn(),
            };
            mockManager.transaction = vi.fn(async (callback) => await callback(mockManager));

            mockOrderRepository.manager = mockManager as any;

            mockPaymentGateway.processPayment = vi.fn().mockResolvedValue({
                success: false,
                error: "Payment declined",
            });

            await expect(
                orderService.checkoutOrder("user_123", "pm_123")
            ).rejects.toThrow("Payment declined");

            expect(mockEmailService.sendOrderConfirmation).not.toHaveBeenCalled();
        });
    });

    describe("getOrdersByUser", () => {
        it("should return paginated orders for user", async () => {
            const orders = [
                createMockOrder({ user: { id: 1 } as User }),
                createMockOrder({ user: { id: 1 } as User }),
            ];

            mockUserRepository.findOneBy.mockResolvedValue(mockUser);
            mockOrderRepository.findAndCount.mockResolvedValue([orders, 2]);

            const result = await orderService.getOrdersByUser("user_123", {
                page: 1,
                limit: 10,
            });

            expect(result.data).toHaveLength(2);
            expect(result.total).toBe(2);
            expect(result.page).toBe(1);
            expect(result.limit).toBe(10);
            expect(result.totalPages).toBe(1);
            expect(mockOrderRepository.findAndCount).toHaveBeenCalledWith({
                where: { user: { id: mockUser.id } },
                relations: ["items", "items.product"],
                order: { createdAt: "DESC" },
                skip: 0,
                take: 10,
            });
        });

        it("should throw error if user not found", async () => {
            mockUserRepository.findOneBy.mockResolvedValue(null);

            await expect(
                orderService.getOrdersByUser("invalid_user")
            ).rejects.toThrow(NotFoundError);
        });

        it("should paginate correctly", async () => {
            mockUserRepository.findOneBy.mockResolvedValue(mockUser);
            mockOrderRepository.findAndCount.mockResolvedValue([[], 25]);

            const result = await orderService.getOrdersByUser("user_123", {
                page: 2,
                limit: 10,
            });

            expect(result.page).toBe(2);
            expect(result.totalPages).toBe(3);
            expect(mockOrderRepository.findAndCount).toHaveBeenCalledWith(
                expect.objectContaining({
                    skip: 10,
                    take: 10,
                })
            );
        });
    });

    describe("getOrderById", () => {
        it("should return order for authorized user", async () => {
            const mockOrder = createMockOrder({
                orderId: "order-123",
                user: { id: 1 } as User,
            });

            mockOrderRepository.findOne.mockResolvedValue(mockOrder);
            mockUserRepository.findOneBy.mockResolvedValue(mockUser);

            const result = await orderService.getOrderById(
                "order-123",
                "user_123",
                UserRole.CUSTOMER
            );

            expect(result).toEqual(mockOrder);
            expect(mockOrderRepository.findOne).toHaveBeenCalledWith({
                where: { orderId: "order-123" },
                relations: ["items", "items.product"],
            });
        });

        it("should return order for admin without ownership check", async () => {
            const mockOrder = createMockOrder({
                orderId: "order-123",
                user: { id: 999 } as User,
            });

            mockOrderRepository.findOne.mockResolvedValue(mockOrder);

            const result = await orderService.getOrderById(
                "order-123",
                "admin_user",
                UserRole.ADMIN
            );

            expect(result).toEqual(mockOrder);
            expect(mockUserRepository.findOneBy).not.toHaveBeenCalled();
        });

        it("should throw error if order not found", async () => {
            mockOrderRepository.findOne.mockResolvedValue(null);

            await expect(
                orderService.getOrderById("missing-order", "user_123", UserRole.CUSTOMER)
            ).rejects.toThrow(NotFoundError);
        });

        it("should throw ForbiddenError if user not authorized", async () => {
            const mockOrder = createMockOrder({
                orderId: "order-123",
                user: { id: 999 } as User,
            });

            mockOrderRepository.findOne.mockResolvedValue(mockOrder);
            mockUserRepository.findOneBy.mockResolvedValue(mockUser);

            await expect(
                orderService.getOrderById("order-123", "user_123", UserRole.CUSTOMER)
            ).rejects.toThrow(ForbiddenError);
        });
    });

    describe("getOrders", () => {
        it("should return all orders with pagination", async () => {
            const orders = [
                createMockOrder(),
                createMockOrder(),
            ];

            const mockQueryBuilder = {
                leftJoinAndSelect: vi.fn().mockReturnThis(),
                orderBy: vi.fn().mockReturnThis(),
                skip: vi.fn().mockReturnThis(),
                take: vi.fn().mockReturnThis(),
                andWhere: vi.fn().mockReturnThis(),
                getManyAndCount: vi.fn().mockResolvedValue([orders, 2]),
            };

            mockOrderRepository.createQueryBuilder.mockReturnValue(
                mockQueryBuilder as any
            );

            const result = await orderService.getOrders({ page: 1, limit: 10 });

            expect(result.data).toHaveLength(2);
            expect(result.total).toBe(2);
            expect(result.page).toBe(1);
            expect(result.limit).toBe(10);
            expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
                "order.items",
                "items"
            );
            expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
                "items.product",
                "product"
            );
            expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
                "order.user",
                "user"
            );
        });

        it("should filter by search term", async () => {
            const mockQueryBuilder = {
                leftJoinAndSelect: vi.fn().mockReturnThis(),
                orderBy: vi.fn().mockReturnThis(),
                skip: vi.fn().mockReturnThis(),
                take: vi.fn().mockReturnThis(),
                andWhere: vi.fn().mockReturnThis(),
                getManyAndCount: vi.fn().mockResolvedValue([[], 0]),
            };

            mockOrderRepository.createQueryBuilder.mockReturnValue(
                mockQueryBuilder as any
            );

            await orderService.getOrders({ search: "test", page: 1, limit: 10 });

            expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
        });
    });
});
