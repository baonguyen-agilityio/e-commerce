import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import { OrderController } from "../order.controller";
import { OrderService } from "../order.service";
import { createOrderRoutes } from "../order.routes";
import { createMockOrder } from "@/test/factories/order.factory";
import { OrderStatus } from "../entities/Order";
import { errorHandler } from "@/shared/middleware/errorHandler";

vi.mock("@/shared/middleware/requireAuth", () => ({
    requireAuth: () => (req: any, res: any, next: any) => {
        req.auth = { userId: "user_123", role: "customer" };
        next();
    },
}));

describe("OrderController", () => {
    let app: express.Application;
    let mockOrderService: OrderService;

    beforeEach(() => {
        mockOrderService = {
            checkoutOrder: vi.fn(),
            getOrders: vi.fn(),
            getOrdersByUser: vi.fn(),
            getOrderById: vi.fn(),
        } as unknown as OrderService;

        app = express();
        app.use(express.json());

        const orderController = new OrderController(mockOrderService);
        app.use("/orders", createOrderRoutes(orderController));
        app.use(errorHandler);
    });

    describe("POST /orders", () => {
        it("should return 200 and checkout result", async () => {
            const order = createMockOrder({
                publicId: "order-123",
                status: OrderStatus.PAID,
                paymentId: "pi_123",
                total: 100,
            });

            const checkoutResult = {
                success: true,
                order,
            };

            vi.mocked(mockOrderService.checkoutOrder).mockResolvedValue(checkoutResult);

            const response = await request(app)
                .post("/orders")
                .send({ paymentMethodId: "pm_123" });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.order.status).toBe(OrderStatus.PAID);
            expect(mockOrderService.checkoutOrder).toHaveBeenCalledWith(
                "user_123",
                "pm_123"
            );
        });
    });

    describe("GET /orders", () => {
        it("should return 200 and paginated orders (admin)", async () => {
            const orders = [
                createMockOrder({ publicId: "order-1" }),
                createMockOrder({ publicId: "order-2" }),
            ];

            const mockResult = {
                data: orders,
                total: 2,
                totalPages: 1,
                page: 1,
                limit: 10,
            };

            vi.mocked(mockOrderService.getOrders).mockResolvedValue(mockResult);

            const response = await request(app)
                .get("/orders")
                .query({ page: 1, limit: 10 });

            expect(response.status).toBe(200);
            expect(response.body.data).toHaveLength(2);
            expect(mockOrderService.getOrders).toHaveBeenCalledWith(
                expect.objectContaining({ page: 1, limit: 10 })
            );
        });

        it("should support search query", async () => {
            const mockResult = {
                data: [],
                total: 0,
                totalPages: 0,
                page: 1,
                limit: 10,
            };

            vi.mocked(mockOrderService.getOrders).mockResolvedValue(mockResult);

            await request(app)
                .get("/orders")
                .query({ search: "order-123" });

            expect(mockOrderService.getOrders).toHaveBeenCalledWith(
                expect.objectContaining({ search: "order-123" })
            );
        });
    });

    describe("GET /orders/me", () => {
        it("should return 200 and user's orders", async () => {
            const orders = [
                createMockOrder({ userId: 1, publicId: "order-1" }),
            ];

            const mockResult = {
                data: orders,
                total: 1,
                totalPages: 1,
                page: 1,
                limit: 10,
            };

            vi.mocked(mockOrderService.getOrdersByUser).mockResolvedValue(mockResult);

            const response = await request(app)
                .get("/orders/me")
                .query({ page: 1, limit: 10 });

            expect(response.status).toBe(200);
            expect(response.body.data).toHaveLength(1);
            expect(mockOrderService.getOrdersByUser).toHaveBeenCalledWith(
                "user_123",
                expect.objectContaining({ page: 1, limit: 10 })
            );
        });
    });

    describe("GET /orders/:orderId", () => {
        it("should return 200 and order details", async () => {
            const order = createMockOrder({
                publicId: "order-123",
                userId: 1,
                status: OrderStatus.PAID,
            });

            vi.mocked(mockOrderService.getOrderById).mockResolvedValue(order);

            const response = await request(app).get("/orders/order-123");

            expect(response.status).toBe(200);
            expect(response.body.publicId).toBe("order-123");
            expect(mockOrderService.getOrderById).toHaveBeenCalledWith(
                "order-123",
                "user_123",
                "customer"
            );
        });
    });
});
