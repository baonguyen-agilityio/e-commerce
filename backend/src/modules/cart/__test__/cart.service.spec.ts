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
    let mockCartRepository: any;
    let mockCartItemRepository: any;
    let mockProductRepository: any;

    let mockCart: Cart;
    let mockProduct: Product;
    let mockCartItem: CartItem;

    beforeEach(() => {
        mockCartRepository = {
            ...createMockRepository<Cart>(),
            findOrCreateByClerkId: vi.fn(),
            findByClerkIdWithItems: vi.fn(),
        };
        mockCartItemRepository = {
            ...createMockRepository<CartItem>(),
            findByCartAndProduct: vi.fn(),
            findByCartItemIdAndCartId: vi.fn(),
            deleteById: vi.fn(),
            deleteByCart: vi.fn(),
        };
        mockProductRepository = {
            ...createMockRepository<Product>(),
            findByProductId: vi.fn(),
        };

        cartService = new CartService(
            mockCartRepository,
            mockCartItemRepository,
            mockProductRepository
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
        it("should return cart from repository", async () => {
            mockCartRepository.findOrCreateByClerkId.mockResolvedValue(mockCart);

            const result = await cartService.getOrCreateCart("user_123");

            expect(result).toEqual(mockCart);
            expect(mockCartRepository.findOrCreateByClerkId).toHaveBeenCalledWith("user_123");
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

            mockCartRepository.findOrCreateByClerkId.mockResolvedValue(cart);

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

            mockCartRepository.findOrCreateByClerkId.mockResolvedValue(emptyCart);

            const result = await cartService.getCartByClerkId("user_123");

            expect(result.subtotal).toBe(0);
            expect(result.itemCount).toBe(0);
        });

        it("should create cart if not found", async () => {
            // This test is somewhat redundant as getOrCreateCart handles creation via repository.
            // However, we can test that getCartByClerkId properly returns the created cart.
            const newCart = createMockCart({
                clerkId: "user_789",
                items: [],
            });

            mockCartRepository.findOrCreateByClerkId.mockResolvedValue(newCart);

            const result = await cartService.getCartByClerkId("user_789");

            expect(result.subtotal).toBe(0);
            expect(result.itemCount).toBe(0);
            expect(mockCartRepository.findOrCreateByClerkId).toHaveBeenCalledWith("user_789");
        });
    });

    describe("addItemToCart", () => {
        it("should add new item to cart successfully", async () => {
            const emptyCart = createMockCart({
                id: 1,
                clerkId: "user_123",
                items: [],
            });

            mockCartRepository.findOrCreateByClerkId.mockResolvedValue(emptyCart);
            mockProductRepository.findByProductId.mockResolvedValue(mockProduct);
            mockCartItemRepository.findByCartAndProduct.mockResolvedValue(null);
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

            mockCartRepository.findOrCreateByClerkId.mockResolvedValue(mockCart);
            mockProductRepository.findByProductId.mockResolvedValue(mockProduct);
            mockCartItemRepository.findByCartAndProduct.mockResolvedValue(existingItem);
            mockCartItemRepository.save.mockResolvedValue({ ...existingItem, quantity: 5 });

            const result = await cartService.addItemToCart("user_123", "prod-123", 3);

            expect(result.quantity).toBe(5);
            expect(mockCartItemRepository.save).toHaveBeenCalled();
        });

        it("should throw error if product not found", async () => {
            mockCartRepository.findOrCreateByClerkId.mockResolvedValue(mockCart);
            mockProductRepository.findByProductId.mockResolvedValue(null);

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

            mockCartRepository.findOrCreateByClerkId.mockResolvedValue(mockCart);
            mockProductRepository.findByProductId.mockResolvedValue(inactiveProduct);

            await expect(
                cartService.addItemToCart("user_123", "prod-123", 1)
            ).rejects.toThrow(NotFoundError);
        });

        it("should throw error if insufficient stock for new item", async () => {
            const lowStockProduct = createMockProduct({
                id: 1,
                stock: 2,
            });

            mockCartRepository.findOrCreateByClerkId.mockResolvedValue(mockCart);
            mockProductRepository.findByProductId.mockResolvedValue(lowStockProduct);

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

            mockCartRepository.findOrCreateByClerkId.mockResolvedValue(mockCart);
            mockProductRepository.findByProductId.mockResolvedValue(mockProduct);
            mockCartItemRepository.findByCartAndProduct.mockResolvedValue(existingItem);

            // Re-mock product stock to be 10 (default in factory is 10)
            // existing 7 + requested 5 = 12 > 10.

            await expect(
                cartService.addItemToCart("user_123", "prod-123", 5)
            ).rejects.toThrow(BadRequestError);
            await expect(
                cartService.addItemToCart("user_123", "prod-123", 5)
            ).rejects.toThrow("don't have enough stock");
        });

        it("should add default quantity of 1 if not specified", async () => {
            mockCartRepository.findOrCreateByClerkId.mockResolvedValue(mockCart);
            mockProductRepository.findByProductId.mockResolvedValue(mockProduct);
            mockCartItemRepository.findByCartAndProduct.mockResolvedValue(null);
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

            mockCartRepository.findOrCreateByClerkId.mockResolvedValue(mockCart);
            mockCartItemRepository.findByCartItemIdAndCartId.mockResolvedValue(mockCartItem);
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
            mockCartRepository.findOrCreateByClerkId.mockResolvedValue(mockCart);
            mockCartItemRepository.findByCartItemIdAndCartId.mockResolvedValue(null);

            await expect(
                cartService.updateItemQuantity("user_123", "missing-item", 3)
            ).rejects.toThrow(NotFoundError);
            await expect(
                cartService.updateItemQuantity("user_123", "missing-item", 3)
            ).rejects.toThrow("This item is no longer in your cart");
        });

        it("should throw error if quantity is 0", async () => {
            mockCartRepository.findOrCreateByClerkId.mockResolvedValue(mockCart);
            mockCartItemRepository.findByCartItemIdAndCartId.mockResolvedValue(mockCartItem);

            await expect(
                cartService.updateItemQuantity("user_123", "item-123", 0)
            ).rejects.toThrow(BadRequestError);
            await expect(
                cartService.updateItemQuantity("user_123", "item-123", 0)
            ).rejects.toThrow("Quantity must be at least 1");
        });

        it("should throw error if quantity is negative", async () => {
            mockCartRepository.findOrCreateByClerkId.mockResolvedValue(mockCart);
            mockCartItemRepository.findByCartItemIdAndCartId.mockResolvedValue(mockCartItem);

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

            mockCartRepository.findOrCreateByClerkId.mockResolvedValue(mockCart);
            mockCartItemRepository.findByCartItemIdAndCartId.mockResolvedValue(item);

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

            mockCartRepository.findOrCreateByClerkId
                .mockResolvedValueOnce(mockCart) // called by removeItem
                .mockResolvedValueOnce(updatedCart); // called by getCart

            mockCartItemRepository.findByCartItemIdAndCartId.mockResolvedValue(mockCartItem);
            mockCartItemRepository.deleteById.mockResolvedValue({ affected: 1 } as any);

            const result = await cartService.removeItemFromCart(
                "user_123",
                "item-123"
            );

            expect(result.items).toHaveLength(0);
            expect(mockCartItemRepository.deleteById).toHaveBeenCalledWith(
                mockCartItem.id
            );
        });

        it("should throw error if cart item not found", async () => {
            mockCartRepository.findOrCreateByClerkId.mockResolvedValue(mockCart);
            mockCartItemRepository.findByCartItemIdAndCartId.mockResolvedValue(null);

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

            mockCartRepository.findOrCreateByClerkId
                .mockResolvedValueOnce(mockCart)
                .mockResolvedValueOnce(emptyCart);

            mockCartItemRepository.deleteByCart.mockResolvedValue({ affected: 1 } as any);

            const result = await cartService.clearCart("user_123");

            expect(result.items).toHaveLength(0);
            expect(result.subtotal).toBe(0);
            expect(result.itemCount).toBe(0);
            expect(mockCartItemRepository.deleteByCart).toHaveBeenCalledWith(mockCart.id);
        });

        it("should work even if cart is already empty", async () => {
            const emptyCart = createMockCart({
                clerkId: "user_123",
                items: [],
            });

            mockCartRepository.findOrCreateByClerkId.mockResolvedValue(emptyCart);
            mockCartItemRepository.deleteByCart.mockResolvedValue({ affected: 0 } as any);

            const result = await cartService.clearCart("user_123");

            expect(result.items).toHaveLength(0);
            expect(mockCartItemRepository.deleteByCart).toHaveBeenCalled();
        });
    });
});
