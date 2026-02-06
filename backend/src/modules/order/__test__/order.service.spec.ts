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
import { DataSource } from "typeorm";

describe("OrderService", () => {
    let orderService: OrderService;
    let mockOrderRepository: any;
    let mockUserRepository: any;
    let mockCartRepository: any;
    let mockCartItemRepository: any;
    let mockProductRepository: any;
    let mockPaymentGateway: IPaymentGateway;
    let mockEmailService: IEmailService;
    let mockDataSource: any;
    let mockManager: any;

    let mockUser: User;
    let mockCart: Cart;
    let mockProduct: Product;
    let mockCartItem: CartItem;

    beforeEach(() => {
        // Mock repositories with specific domain methods
        mockOrderRepository = {
            ...createMockRepository<Order>(),
            findByOrderId: vi.fn(),
            findByUser: vi.fn(),
            findAll: vi.fn(),
        };
        mockUserRepository = {
            ...createMockRepository<User>(),
            findByClerkId: vi.fn(),
        };
        mockCartRepository = {
            ...createMockRepository<Cart>(),
            findByClerkIdWithItems: vi.fn(),
        };
        mockCartItemRepository = {
            ...createMockRepository<CartItem>(),
            findByCartAndProduct: vi.fn(),
            findAllByCart: vi.fn(),
            deleteByCart: vi.fn(),
            findByCartItemIdAndCartId: vi.fn(),
            deleteById: vi.fn(),
        };
        mockProductRepository = {
            ...createMockRepository<Product>(),
            findByProductId: vi.fn(),
        };

        mockPaymentGateway = {
            processPayment: vi.fn(),
        };

        mockEmailService = {
            sendOrderConfirmation: vi.fn().mockResolvedValue(undefined),
        };

        mockManager = {
            findOne: vi.fn(),
            create: vi.fn(),
            save: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        };

        mockDataSource = {
            transaction: vi.fn(async (callback) => await callback(mockManager)),
        };

        orderService = new OrderService(
            mockOrderRepository,
            mockUserRepository,
            mockCartRepository,
            mockCartItemRepository,
            mockProductRepository,
            mockPaymentGateway,
            mockEmailService,
            mockDataSource
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

            mockUserRepository.findByClerkId.mockResolvedValue(mockUser);
            mockCartRepository.findByClerkIdWithItems.mockResolvedValue(mockCart);
            mockProductRepository.findByProductId.mockResolvedValue(mockProduct);

            // Mock manager behavior inside transaction
            mockManager.findOne
                .mockResolvedValueOnce(mockProduct) // Check stock
                .mockResolvedValueOnce(mockOrder); // Final order retrieval
            mockManager.create
                .mockReturnValueOnce(mockOrder) // Create order
                .mockReturnValue({}); // Create order items
            mockManager.save.mockResolvedValue(mockOrder);
            mockManager.update.mockResolvedValue({});
            mockManager.delete.mockResolvedValue({});

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
            mockUserRepository.findByClerkId.mockResolvedValue(null);

            await expect(
                orderService.checkoutOrder("invalid_user", "pm_123")
            ).rejects.toThrow(NotFoundError);
        });

        it("should throw error if cart is empty", async () => {
            mockUserRepository.findByClerkId.mockResolvedValue(mockUser);
            mockCartRepository.findByClerkIdWithItems.mockResolvedValue({
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
            mockUserRepository.findByClerkId.mockResolvedValue(mockUser);
            mockCartRepository.findByClerkIdWithItems.mockResolvedValue(null);

            await expect(
                orderService.checkoutOrder("user_123", "pm_123")
            ).rejects.toThrow(BadRequestError);
        });

        it("should remove cart item if product out of stock", async () => {
            mockUserRepository.findByClerkId.mockResolvedValue(mockUser);
            mockCartRepository.findByClerkIdWithItems.mockResolvedValue(mockCart);

            const outOfStockProduct = { ...mockProduct, stock: 0 };
            mockProductRepository.findByProductId.mockResolvedValue(outOfStockProduct);
            mockCartItemRepository.delete.mockResolvedValue({} as any);

            await expect(
                orderService.checkoutOrder("user_123", "pm_123")
            ).rejects.toThrow("out of stock and has been removed");

            expect(mockCartItemRepository.delete).toHaveBeenCalledWith(
                mockCartItem.id
            );
        });

        it("should update cart item if requested quantity exceeds stock", async () => {
            mockUserRepository.findByClerkId.mockResolvedValue(mockUser);

            const limitedStockProduct = { ...mockProduct, stock: 1 };
            const cartWithHighQuantity = {
                ...mockCart,
                items: [{
                    ...mockCartItem,
                    quantity: 5,
                }]
            };

            mockCartRepository.findByClerkIdWithItems.mockResolvedValue(cartWithHighQuantity);
            mockProductRepository.findByProductId.mockResolvedValue(limitedStockProduct);
            mockCartItemRepository.update.mockResolvedValue({} as any);

            await expect(
                orderService.checkoutOrder("user_123", "pm_123")
            ).rejects.toThrow("Your cart has been updated");

            expect(mockCartItemRepository.update).toHaveBeenCalledWith(
                mockCartItem.id,
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

            mockUserRepository.findByClerkId.mockResolvedValue(mockUser);
            mockCartRepository.findByClerkIdWithItems.mockResolvedValue(mockCart);
            mockProductRepository.findByProductId.mockResolvedValue(mockProduct);

            mockManager.findOne
                .mockResolvedValueOnce(mockProduct)
                .mockResolvedValueOnce(mockOrder);
            mockManager.create
                .mockReturnValueOnce(mockOrder)
                .mockReturnValue({});
            mockManager.save.mockResolvedValue(mockOrder);

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

            mockUserRepository.findByClerkId.mockResolvedValue(mockUser);
            mockCartRepository.findByClerkIdWithItems.mockResolvedValue(cart);
            mockProductRepository.findByProductId
                .mockResolvedValueOnce(product1)
                .mockResolvedValueOnce(product2);

            const mockOrder = createMockOrder({ total: 141.75 });

            mockManager.findOne
                .mockResolvedValueOnce(product1)
                .mockResolvedValueOnce(product2)
                .mockResolvedValueOnce(mockOrder);
            mockManager.create.mockReturnValue(mockOrder);

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
            const mockOrder = createMockOrder();
            mockUserRepository.findByClerkId.mockResolvedValue(mockUser);
            mockCartRepository.findByClerkIdWithItems.mockResolvedValue(mockCart);
            mockProductRepository.findByProductId.mockResolvedValue(mockProduct);

            mockManager.findOne
                .mockResolvedValueOnce(mockProduct)
                .mockResolvedValueOnce(mockOrder);
            mockManager.create.mockReturnValue(mockOrder);

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
            const mockOrder = createMockOrder();
            mockUserRepository.findByClerkId.mockResolvedValue(mockUser);
            mockCartRepository.findByClerkIdWithItems.mockResolvedValue(mockCart);
            mockProductRepository.findByProductId.mockResolvedValue(mockProduct);

            mockManager.findOne
                .mockResolvedValueOnce(mockProduct)
                .mockResolvedValueOnce(mockOrder);
            mockManager.create.mockReturnValue(mockOrder);

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
            const mockOrder = createMockOrder();
            mockUserRepository.findByClerkId.mockResolvedValue(mockUser);
            mockCartRepository.findByClerkIdWithItems.mockResolvedValue(mockCart);
            mockProductRepository.findByProductId.mockResolvedValue(mockProduct);

            mockManager.findOne
                .mockResolvedValueOnce(mockProduct)
                .mockResolvedValueOnce(mockOrder);
            mockManager.create.mockReturnValue(mockOrder);
            mockManager.delete = vi.fn();

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

            mockUserRepository.findByClerkId.mockResolvedValue(mockUser);
            mockOrderRepository.findByUser.mockResolvedValue({
                data: orders,
                total: 2,
                page: 1,
                limit: 10,
                totalPages: 1
            });

            const result = await orderService.getOrdersByUser("user_123", {
                page: 1,
                limit: 10,
            });

            expect(result.data).toHaveLength(2);
            expect(result.total).toBe(2);
            expect(mockOrderRepository.findByUser).toHaveBeenCalledWith(mockUser.id, {
                page: 1,
                limit: 10
            });
        });

        it("should throw error if user not found", async () => {
            mockUserRepository.findByClerkId.mockResolvedValue(null);

            await expect(
                orderService.getOrdersByUser("invalid_user")
            ).rejects.toThrow(NotFoundError);
        });
    });

    describe("getOrderById", () => {
        it("should return order for authorized user", async () => {
            const mockOrder = createMockOrder({
                orderId: "order-123",
                user: { id: 1 } as User,
            });

            mockOrderRepository.findByOrderId.mockResolvedValue(mockOrder);
            mockUserRepository.findByClerkId.mockResolvedValue(mockUser);

            const result = await orderService.getOrderById(
                "order-123",
                "user_123",
                UserRole.CUSTOMER
            );

            expect(result).toEqual(mockOrder);
            expect(mockOrderRepository.findByOrderId).toHaveBeenCalledWith("order-123");
        });

        it("should return order for admin without ownership check", async () => {
            const mockOrder = createMockOrder({
                orderId: "order-123",
                user: { id: 999 } as User,
            });

            mockOrderRepository.findByOrderId.mockResolvedValue(mockOrder);

            const result = await orderService.getOrderById(
                "order-123",
                "admin_user",
                UserRole.ADMIN
            );

            expect(result).toEqual(mockOrder);
            expect(mockUserRepository.findByClerkId).not.toHaveBeenCalled();
        });

        it("should throw error if order not found", async () => {
            mockOrderRepository.findByOrderId.mockResolvedValue(null);

            await expect(
                orderService.getOrderById("missing-order", "user_123", UserRole.CUSTOMER)
            ).rejects.toThrow(NotFoundError);
        });

        it("should throw ForbiddenError if user not authorized", async () => {
            const mockOrder = createMockOrder({
                orderId: "order-123",
                user: { id: 999 } as User,
            });

            mockOrderRepository.findByOrderId.mockResolvedValue(mockOrder);
            mockUserRepository.findByClerkId.mockResolvedValue(mockUser);

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

            mockOrderRepository.findAll.mockResolvedValue({
                data: orders,
                total: 2,
                page: 1,
                limit: 10,
                totalPages: 1
            });

            const result = await orderService.getOrders({ page: 1, limit: 10 });

            expect(result.data).toHaveLength(2);
            expect(result.total).toBe(2);
            expect(mockOrderRepository.findAll).toHaveBeenCalledWith({
                page: 1,
                limit: 10
            });
        });

        it("should filter by search term", async () => {
            mockOrderRepository.findAll.mockResolvedValue({
                data: [],
                total: 0,
                page: 1,
                limit: 10,
                totalPages: 0
            });

            await orderService.getOrders({ search: "test", page: 1, limit: 10 });

            expect(mockOrderRepository.findAll).toHaveBeenCalledWith({
                search: "test",
                page: 1,
                limit: 10
            });
        });
    });
});
