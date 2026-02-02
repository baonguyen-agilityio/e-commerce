import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import { CategoryController } from "../category.controller";
import { CategoryService } from "../category.service";
import { createCategoryRoutes } from "../category.routes";
import { createMockCategory } from "@/test/factories/category.factory";
import { errorHandler } from "@/shared/middleware/errorHandler";

vi.mock("@/shared/middleware/requireAuth", () => ({
    requireAuth: () => (req: any, res: any, next: any) => next(),
}));

describe("CategoryController", () => {
    let app: express.Application;
    let mockCategoryService: CategoryService;

    beforeEach(() => {
        mockCategoryService = {
            getAllCategories: vi.fn(),
            getCategoryById: vi.fn(),
            createCategory: vi.fn(),
            updateCategory: vi.fn(),
            deleteCategory: vi.fn(),
        } as unknown as CategoryService;

        app = express();
        app.use(express.json());

        const categoryController = new CategoryController(mockCategoryService);
        app.use("/categories", createCategoryRoutes(categoryController));
        app.use(errorHandler);
    });

    describe("GET /categories", () => {
        it("should return 200 and paginated categories", async () => {
            const mockResult = {
                data: [
                    createMockCategory({ name: "Electronics" }),
                    createMockCategory({ name: "Books" }),
                ],
                total: 2,
                totalPages: 1,
                page: 1,
                limit: 10,
            };

            vi.mocked(mockCategoryService.getAllCategories).mockResolvedValue(mockResult);

            const response = await request(app)
                .get("/categories")
                .query({ page: 1, limit: 10 });

            expect(response.status).toBe(200);
            expect(response.body.data).toHaveLength(2);
            expect(response.body.total).toBe(2);
        });

        it("should support search query", async () => {
            const mockResult = {
                data: [createMockCategory({ name: "Electronics" })],
                total: 1,
                totalPages: 1,
                page: 1,
                limit: 10,
            };

            vi.mocked(mockCategoryService.getAllCategories).mockResolvedValue(mockResult);

            await request(app)
                .get("/categories")
                .query({ search: "Electronics" });

            expect(mockCategoryService.getAllCategories).toHaveBeenCalledWith(
                expect.objectContaining({ search: "Electronics" })
            );
        });
    });

    describe("GET /categories/:id", () => {
        it("should return 200 and category by id", async () => {
            const category = createMockCategory({ categoryId: "cat-123", name: "Electronics" });
            vi.mocked(mockCategoryService.getCategoryById).mockResolvedValue(category);

            const response = await request(app).get("/categories/cat-123");

            expect(response.status).toBe(200);
            expect(response.body.name).toBe("Electronics");
            expect(mockCategoryService.getCategoryById).toHaveBeenCalledWith("cat-123");
        });
    });

    describe("POST /categories", () => {
        it("should return 201 and created category", async () => {
            const newCategory = createMockCategory({
                name: "Home & Garden",
                description: "Home improvement supplies",
            });

            vi.mocked(mockCategoryService.createCategory).mockResolvedValue(newCategory);

            const response = await request(app)
                .post("/categories")
                .send({
                    name: "Home & Garden",
                    description: "Home improvement supplies",
                });

            expect(response.status).toBe(201);
            expect(response.body.name).toBe("Home & Garden");
            expect(mockCategoryService.createCategory).toHaveBeenCalled();
        });
    });

    describe("PUT /categories/:id", () => {
        it("should return 200 and updated category", async () => {
            const updatedCategory = createMockCategory({
                categoryId: "cat-123",
                name: "Electronics & Gadgets",
            });

            vi.mocked(mockCategoryService.updateCategory).mockResolvedValue(updatedCategory);

            const response = await request(app)
                .put("/categories/cat-123")
                .send({ name: "Electronics & Gadgets" });

            expect(response.status).toBe(200);
            expect(response.body.name).toBe("Electronics & Gadgets");
            expect(mockCategoryService.updateCategory).toHaveBeenCalledWith(
                "cat-123",
                expect.objectContaining({ name: "Electronics & Gadgets" })
            );
        });
    });

    describe("DELETE /categories/:id", () => {
        it("should return 200 and delete category", async () => {
            vi.mocked(mockCategoryService.deleteCategory).mockResolvedValue(true);

            const response = await request(app).delete("/categories/cat-123");

            expect(response.status).toBe(200);
            expect(response.body).toBe(true);
            expect(mockCategoryService.deleteCategory).toHaveBeenCalledWith("cat-123");
        });
    });
});
