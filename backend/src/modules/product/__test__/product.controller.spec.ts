import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import { ProductController } from "../product.controller";
import { ProductService } from "../product.service";
import { createProductRoutes } from "../product.routes";
import { createMockProduct } from "@/test/factories/product.factory";
import { errorHandler } from "@/shared/middleware/errorHandler";

vi.mock("@/shared/middleware/requireAuth", () => ({
    requireAuth: () => (req: any, res: any, next: any) => next(),
}));

describe("ProductController", () => {
    let app: express.Application;
    let mockProductService: ProductService;

    beforeEach(() => {
        mockProductService = {
            getAllProducts: vi.fn(),
            getProductByProductId: vi.fn(),
            createProduct: vi.fn(),
            updateProduct: vi.fn(),
            deleteProduct: vi.fn(),
        } as unknown as ProductService;

        app = express();
        app.use(express.json());

        const productController = new ProductController(mockProductService);

        app.use("/products", createProductRoutes(productController));

        app.use(errorHandler);
    });

    describe("GET /products", () => {
        it("should return 200 and a list of products", async () => {
            const mockResult = {
                data: [createMockProduct({ id: 1, name: "Super Laptop" })],
                total: 1,
                totalPages: 1,
                page: 1,
                limit: 10,
            };

            vi.mocked(mockProductService.getAllProducts).mockResolvedValue(mockResult);

            const response = await request(app)
                .get("/products")
                .query({ page: 1, limit: 10 });

            expect(response.status).toBe(200);
            expect(response.body).toEqual(JSON.parse(JSON.stringify(mockResult)));
            expect(mockProductService.getAllProducts).toHaveBeenCalledWith(
                expect.objectContaining({ page: 1, limit: 10 })
            );
        });
    });

    describe("GET /products/:productId", () => {
        it("should return 200 and the product", async () => {
            const product = createMockProduct({ productId: "prod-99" });
            vi.mocked(mockProductService.getProductByProductId).mockResolvedValue(product);

            const response = await request(app).get("/products/prod-99");

            expect(response.status).toBe(200);
            expect(response.body).toEqual(JSON.parse(JSON.stringify(product)));
            expect(mockProductService.getProductByProductId).toHaveBeenCalledWith("prod-99");
        });
    });

    describe("POST /products", () => {
        it("should return 201 and created product", async () => {
            const newProductData = {
                name: "New Integration",
                price: 50.00,
                description: "A test product",
                stock: 5,
                categoryId: "550e8400-e29b-41d4-a716-446655440000"
            };

            const createdProduct = createMockProduct({ ...newProductData, productId: "prod-101" });
            vi.mocked(mockProductService.createProduct).mockResolvedValue(createdProduct);

            const response = await request(app)
                .post("/products")
                .send(newProductData);

            expect(response.status).toBe(201);
            expect(response.body).toMatchObject({
                name: createdProduct.name,
                productId: "prod-101"
            });
            expect(mockProductService.createProduct).toHaveBeenCalledWith(expect.objectContaining(newProductData));
        });

        it("should return 400 if validation fails", async () => {
            const invalidData = { name: "I have no price" };

            const response = await request(app)
                .post("/products")
                .send(invalidData);

            expect(response.status).toBe(400);
            expect(mockProductService.createProduct).not.toHaveBeenCalled();
        });
    });

    describe("PUT /products/:productId", () => {
        it("should return 200 and updated product", async () => {
            const updateData = { name: "Updated Name" };
            const updatedProduct = createMockProduct({ productId: "prod-10", ...updateData });

            vi.mocked(mockProductService.updateProduct).mockResolvedValue(updatedProduct);

            const response = await request(app)
                .put("/products/prod-10")
                .send(updateData);

            expect(response.status).toBe(200);
            expect(response.body.name).toBe("Updated Name");
            expect(mockProductService.updateProduct).toHaveBeenCalledWith("prod-10", expect.objectContaining(updateData));
        });
    });

    describe("DELETE /products/:productId", () => {
        it("should return 200 and result boolean", async () => {
            vi.mocked(mockProductService.deleteProduct).mockResolvedValue(true);

            const response = await request(app).delete("/products/prod-123");

            expect(response.status).toBe(200);
            expect(response.body).toBe(true);
            expect(mockProductService.deleteProduct).toHaveBeenCalledWith("prod-123");
        });
    });
});
