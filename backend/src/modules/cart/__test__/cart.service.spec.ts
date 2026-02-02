import { describe, it, expect, vi, beforeEach } from "vitest";
import { CartService } from "../cart.service";
import { Cart } from "../entities/Cart";
import { CartItem } from "../entities/CartItem";
import { Product } from "@/modules/product/entities/Product";
import {
    createMockRepository,
    MockRepository,
} from "@/test/mocks/repository.mock";
import { BadRequestError, NotFoundError } from "@/shared/errors";
import { createMockCart, createMockCartItem } from "@/test/factories/cart.factory";
import { createMockProduct } from "@/test/factories/product.factory";

describe("CartService", () => {
    let cartService: CartService;
    let mockCartRepository: MockRepository<Cart>;
    let mockCartItemRepository: MockRepository<CartItem>;
    let mockProductRepository: MockRepository<Product>;

    let mockCart: Cart;
    let mockProduct: Product;
    let mockCartItem: CartItem;

    beforeEach(() => {
        mockCartRepository = createMockRepository<Cart>();
        mockCartItemRepository = createMockRepository<CartItem>();
        mockProductRepository = createMockRepository<Product>();

        cartService = new CartService(
            mockCartRepository as any,
            mockCartItemRepository as any,
            mockProductRepository as any
        );

        mockProduct = createMockProduct({
            id: 1,
            productId: "prod-123",
            name: "Test Product",
            price: 50.00,
            stock: 10,
            isActive: true,
        });

        mockCartItem = createMockCartItem({
            id: 1,
            quantity: 2,
            product: mockProduct,
            cart: mockCart,
        });

        mockCart = createMockCart({
            id: 1,
            clerkId: "user_123",
            items: [mockCartItem],
        });
    });

    describe("getOrCreateCart", () => {
        it("should return existing cart if found", async () => {
            mockCartRepository.findOne.mockResolvedValue(mockCart);

            const result = await cartService.getOrCreateCart("user_123");

            expect(result).toEqual(mockCart);
            expect(mockCartRepository.findOne).toHaveBeenCalledWith({
                where: { clerkId: "user_123" },
                relations: ["items", "items.product"],
            });
        });

        it("should create new cart if not found", async () => {
            const newCart = createMockCart({
                id: 2,
                clerkId: "user_456",
                items: [],
            });

            mockCartRepository.findOne.mockResolvedValue(null);
            mockCartRepository.create.mockReturnValue(newCart);
            mockCartRepository.save.mockResolvedValue(newCart);

            const result = await cartService.getOrCreateCart("user_456");

            expect(result).toEqual(newCart);
            expect(mockCartRepository.create).toHaveBeenCalledWith({
                clerkId: "user_456",
                items: [],
            });
            expect(mockCartRepository.save).toHaveBeenCalledWith(newCart);
        });
    });

    describe("getCartByClerkId", () => {
        it("should return cart with correct subtotal and itemCount", async () => {
            const product1 = createMockProduct({ price: 25.50 });
            const product2 = createMockProduct({ price: 30.25 });

            const cart = createMockCart({
                clerkId: "user_123",
                items: [
                    createMockCartItem({ quantity: 2, product: product1 }),
                    createMockCartItem({ quantity: 3, product: product2 }),
                ],
            });

            mockCartRepository.findOne.mockResolvedValue(cart);

            const result = await cartService.getCartByClerkId("user_123");

            expect(result.subtotal).toBe(141.75);
            expect(result.itemCount).toBe(5);
            expect(result.items).toHaveLength(2);
        });

        it("should return cart with zero subtotal if empty", async () => {
            const emptyCart = createMockCart({
                clerkId: "user_123",
                items: [],
            });

            mockCartRepository.findOne.mockResolvedValue(emptyCart);

            const result = await cartService.getCartByClerkId("user_123");

            expect(result.subtotal).toBe(0);
            expect(result.itemCount).toBe(0);
        });

        it("should create cart if not found", async () => {
            const newCart = createMockCart({
                clerkId: "user_789",
                items: [],
            });

            mockCartRepository.findOne.mockResolvedValue(null);
            mockCartRepository.create.mockReturnValue(newCart);
            mockCartRepository.save.mockResolvedValue(newCart);

            const result = await cartService.getCartByClerkId("user_789");

            expect(result.subtotal).toBe(0);
            expect(result.itemCount).toBe(0);
            expect(mockCartRepository.create).toHaveBeenCalled();
        });
    });

    describe("addItemToCart", () => {
        it("should add new item to cart successfully", async () => {
            const emptyCart = createMockCart({
                id: 1,
                clerkId: "user_123",
                items: [],
            });

            mockCartRepository.findOne.mockResolvedValue(emptyCart);
            mockProductRepository.findOne.mockResolvedValue(mockProduct);
            mockCartItemRepository.findOne.mockResolvedValue(null);
            mockCartItemRepository.create.mockReturnValue(mockCartItem);
            mockCartItemRepository.save.mockResolvedValue(mockCartItem);

            const result = await cartService.addItemToCart("user_123", "prod-123", 2);

            expect(result).toEqual(mockCartItem);
            expect(mockCartItemRepository.create).toHaveBeenCalledWith({
                quantity: 2,
                product: mockProduct,
                cart: emptyCart,
            });
            expect(mockCartItemRepository.save).toHaveBeenCalled();
        });

        it("should increase quantity for existing item", async () => {
            const existingItem = createMockCartItem({
                id: 1,
                quantity: 2,
                product: mockProduct,
            });

            mockCartRepository.findOne.mockResolvedValue(mockCart);
            mockProductRepository.findOne.mockResolvedValue(mockProduct);
            mockCartItemRepository.findOne.mockResolvedValue(existingItem);
            mockCartItemRepository.save.mockResolvedValue({ ...existingItem, quantity: 5 });

            const result = await cartService.addItemToCart("user_123", "prod-123", 3);

            expect(result.quantity).toBe(5);
            expect(mockCartItemRepository.save).toHaveBeenCalled();
        });

        it("should throw error if product not found", async () => {
            mockCartRepository.findOne.mockResolvedValue(mockCart);
            mockProductRepository.findOne.mockResolvedValue(null);

            await expect(
                cartService.addItemToCart("user_123", "missing-prod", 1)
            ).rejects.toThrow(NotFoundError);
            await expect(
                cartService.addItemToCart("user_123", "missing-prod", 1)
            ).rejects.toThrow("This product is currently unavailable");
        });

        it("should throw error if product is inactive", async () => {
            const inactiveProduct = createMockProduct({
                id: 1,
                isActive: false,
            });

            mockCartRepository.findOne.mockResolvedValue(mockCart);
            mockProductRepository.findOne.mockResolvedValue(inactiveProduct);

            await expect(
                cartService.addItemToCart("user_123", "prod-123", 1)
            ).rejects.toThrow(NotFoundError);
        });

        it("should throw error if insufficient stock for new item", async () => {
            const lowStockProduct = createMockProduct({
                id: 1,
                stock: 2,
            });

            mockCartRepository.findOne.mockResolvedValue(mockCart);
            mockProductRepository.findOne.mockResolvedValue(lowStockProduct);

            await expect(
                cartService.addItemToCart("user_123", "prod-123", 5)
            ).rejects.toThrow(BadRequestError);
            await expect(
                cartService.addItemToCart("user_123", "prod-123", 5)
            ).rejects.toThrow("don't have enough items in stock");
        });

        it("should throw error if total quantity exceeds stock", async () => {
            const existingItem = createMockCartItem({
                quantity: 7,
                product: mockProduct,
            });

            mockCartRepository.findOne.mockResolvedValue(mockCart);
            mockProductRepository.findOne.mockResolvedValue(mockProduct);
            mockCartItemRepository.findOne.mockResolvedValue(existingItem);

            await expect(
                cartService.addItemToCart("user_123", "prod-123", 5)
            ).rejects.toThrow(BadRequestError);
            await expect(
                cartService.addItemToCart("user_123", "prod-123", 5)
            ).rejects.toThrow("don't have enough stock");
        });

        it("should add default quantity of 1 if not specified", async () => {
            mockCartRepository.findOne.mockResolvedValue(mockCart);
            mockProductRepository.findOne.mockResolvedValue(mockProduct);
            mockCartItemRepository.findOne.mockResolvedValue(null);
            mockCartItemRepository.create.mockReturnValue(mockCartItem);
            mockCartItemRepository.save.mockResolvedValue(mockCartItem);

            await cartService.addItemToCart("user_123", "prod-123");

            expect(mockCartItemRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    quantity: 1,
                })
            );
        });
    });

    describe("updateItemQuantity", () => {
        it("should update quantity successfully", async () => {
            const updatedItem = { ...mockCartItem, quantity: 5 };

            mockCartRepository.findOne.mockResolvedValue(mockCart);
            mockCartItemRepository.findOne.mockResolvedValue(mockCartItem);
            mockCartItemRepository.save.mockResolvedValue(updatedItem);

            const result = await cartService.updateItemQuantity(
                "user_123",
                "item-123",
                5
            );

            expect(result.quantity).toBe(5);
            expect(mockCartItemRepository.save).toHaveBeenCalled();
        });

        it("should throw error if cart item not found", async () => {
            mockCartRepository.findOne.mockResolvedValue(mockCart);
            mockCartItemRepository.findOne.mockResolvedValue(null);

            await expect(
                cartService.updateItemQuantity("user_123", "missing-item", 3)
            ).rejects.toThrow(NotFoundError);
            await expect(
                cartService.updateItemQuantity("user_123", "missing-item", 3)
            ).rejects.toThrow("This item is no longer in your cart");
        });

        it("should throw error if quantity is 0", async () => {
            mockCartRepository.findOne.mockResolvedValue(mockCart);
            mockCartItemRepository.findOne.mockResolvedValue(mockCartItem);

            await expect(
                cartService.updateItemQuantity("user_123", "item-123", 0)
            ).rejects.toThrow(BadRequestError);
            await expect(
                cartService.updateItemQuantity("user_123", "item-123", 0)
            ).rejects.toThrow("Quantity must be at least 1");
        });

        it("should throw error if quantity is negative", async () => {
            mockCartRepository.findOne.mockResolvedValue(mockCart);
            mockCartItemRepository.findOne.mockResolvedValue(mockCartItem);

            await expect(
                cartService.updateItemQuantity("user_123", "item-123", -1)
            ).rejects.toThrow(BadRequestError);
            await expect(
                cartService.updateItemQuantity("user_123", "item-123", -1)
            ).rejects.toThrow("Use removeItemFromCart to delete items");
        });

        it("should throw error if insufficient stock", async () => {
            const lowStockProduct = createMockProduct({
                id: 1,
                stock: 3,
            });

            const item = createMockCartItem({
                product: lowStockProduct,
            });

            mockCartRepository.findOne.mockResolvedValue(mockCart);
            mockCartItemRepository.findOne.mockResolvedValue(item);

            await expect(
                cartService.updateItemQuantity("user_123", "item-123", 5)
            ).rejects.toThrow(BadRequestError);
        });
    });

    describe("removeItemFromCart", () => {
        it("should remove item and return updated cart", async () => {
            const updatedCart = createMockCart({
                clerkId: "user_123",
                items: [],
            });

            mockCartRepository.findOne
                .mockResolvedValueOnce(mockCart)
                .mockResolvedValueOnce(updatedCart);
            mockCartItemRepository.findOne.mockResolvedValue(mockCartItem);
            mockCartItemRepository.delete.mockResolvedValue({ affected: 1 } as any);

            const result = await cartService.removeItemFromCart(
                "user_123",
                "item-123"
            );

            expect(result.items).toHaveLength(0);
            expect(mockCartItemRepository.delete).toHaveBeenCalledWith(
                mockCartItem.id
            );
        });

        it("should throw error if cart item not found", async () => {
            mockCartRepository.findOne.mockResolvedValue(mockCart);
            mockCartItemRepository.findOne.mockResolvedValue(null);

            await expect(
                cartService.removeItemFromCart("user_123", "missing-item")
            ).rejects.toThrow(NotFoundError);
        });
    });

    describe("clearCart", () => {
        it("should remove all items from cart", async () => {
            const emptyCart = createMockCart({
                clerkId: "user_123",
                items: [],
            });

            mockCartRepository.findOne
                .mockResolvedValueOnce(mockCart)
                .mockResolvedValueOnce(emptyCart);
            mockCartItemRepository.delete.mockResolvedValue({ affected: 1 } as any);

            const result = await cartService.clearCart("user_123");

            expect(result.items).toHaveLength(0);
            expect(result.subtotal).toBe(0);
            expect(result.itemCount).toBe(0);
            expect(mockCartItemRepository.delete).toHaveBeenCalledWith({ cart: { id: mockCart.id } });
        });

        it("should work even if cart is already empty", async () => {
            const emptyCart = createMockCart({
                clerkId: "user_123",
                items: [],
            });

            mockCartRepository.findOne.mockResolvedValue(emptyCart);
            mockCartItemRepository.delete.mockResolvedValue({ affected: 0 } as any);

            const result = await cartService.clearCart("user_123");

            expect(result.items).toHaveLength(0);
            expect(mockCartItemRepository.delete).toHaveBeenCalled();
        });
    });
});
