import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import { CartController } from "../cart.controller";
import { CartService } from "../cart.service";
import { createCartRoutes } from "../cart.routes";
import { createMockCart, createMockCartItem } from "@/test/factories/cart.factory";
import { createMockProduct } from "@/test/factories/product.factory";
import { errorHandler } from "@/shared/middleware/errorHandler";

vi.mock("@/shared/middleware/requireAuth", () => ({
    requireAuth: () => (req: any, res: any, next: any) => {
        req.auth = { userId: "user_123", role: "customer" };
        next();
    },
}));

vi.mock("@/shared/middleware/validate", () => ({
    validate: () => (req: any, res: any, next: any) => next(),
}));

describe("CartController", () => {
    let app: express.Application;
    let mockCartService: CartService;

    beforeEach(() => {
        mockCartService = {
            getCartByClerkId: vi.fn(),
            addItemToCart: vi.fn(),
            updateItemQuantity: vi.fn(),
            removeItemFromCart: vi.fn(),
            clearCart: vi.fn(),
        } as unknown as CartService;

        app = express();
        app.use(express.json());

        const cartController = new CartController(mockCartService);
        app.use("/cart", createCartRoutes(cartController));
        app.use(errorHandler);
    });

    describe("GET /cart", () => {
        it("should return 200 and user's cart", async () => {
            const product = createMockProduct({ name: "Test Product", price: 50 });
            const cartItem = createMockCartItem({ quantity: 2, product });
            const cart = createMockCart({
                clerkId: "user_123",
                items: [cartItem]
            });
            const cartWithTotal = {
                ...cart,
                subtotal: 100,
                itemCount: 2,
            };

            vi.mocked(mockCartService.getCartByClerkId).mockResolvedValue(cartWithTotal);

            const response = await request(app).get("/cart");

            expect(response.status).toBe(200);
            expect(response.body.itemCount).toBe(2);
            expect(response.body.subtotal).toBe(100);
            expect(mockCartService.getCartByClerkId).toHaveBeenCalledWith("user_123");
        });
    });

    describe("POST /cart/items", () => {
        it("should return 201 and add item to cart", async () => {
            const product = createMockProduct({ publicId: "prod-123" });
            const cartItem = createMockCartItem({
                quantity: 1,
                product,
            });

            vi.mocked(mockCartService.addItemToCart).mockResolvedValue(cartItem);

            const response = await request(app)
                .post("/cart/items")
                .send({ publicId: "prod-123", quantity: 1 });

            expect(response.status).toBe(201);
            expect(mockCartService.addItemToCart).toHaveBeenCalledWith(
                "user_123",
                "prod-123",
                1
            );
        });
    });

    describe("PUT /cart/items/:publicId", () => {
        it("should return 200 and update item quantity", async () => {
            const updatedItem = createMockCartItem({
                publicId: "item-123",
                quantity: 5,
            });

            vi.mocked(mockCartService.updateItemQuantity).mockResolvedValue(updatedItem);

            const response = await request(app)
                .put("/cart/items/item-123")
                .send({ quantity: 5 });

            expect(response.status).toBe(200);
            expect(response.body.quantity).toBe(5);
            expect(mockCartService.updateItemQuantity).toHaveBeenCalledWith(
                "user_123",
                "item-123",
                5
            );
        });
    });

    describe("DELETE /cart/items/:publicId", () => {
        it("should return 200 and remove item from cart", async () => {
            const cart = createMockCart({ items: [] });
            const cartWithTotal = {
                ...cart,
                subtotal: 0,
                itemCount: 0,
            };

            vi.mocked(mockCartService.removeItemFromCart).mockResolvedValue(cartWithTotal);

            const response = await request(app).delete("/cart/items/item-123");

            expect(response.status).toBe(200);
            expect(response.body.itemCount).toBe(0);
            expect(mockCartService.removeItemFromCart).toHaveBeenCalledWith(
                "user_123",
                "item-123"
            );
        });
    });

    describe("DELETE /cart", () => {
        it("should return 200 and clear entire cart", async () => {
            const emptyCart = createMockCart({ items: [] });
            const cartWithTotal = {
                ...emptyCart,
                subtotal: 0,
                itemCount: 0,
            };

            vi.mocked(mockCartService.clearCart).mockResolvedValue(cartWithTotal);

            const response = await request(app).delete("/cart");

            expect(response.status).toBe(200);
            expect(response.body.items).toHaveLength(0);
            expect(mockCartService.clearCart).toHaveBeenCalledWith("user_123");
        });
    });
});
