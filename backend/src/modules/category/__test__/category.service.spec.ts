import { describe, it, expect, vi, beforeEach } from "vitest";
import { CategoryService } from "../category.service";
import { Category } from "../entities/Category";
import {
    createMockRepository,
    MockRepository,
} from "@/test/mocks/repository.mock";
import { BadRequestError, NotFoundError } from "@/shared/errors";
import { createMockCategory } from "@/test/factories/category.factory";
import { createMockProduct } from "@/test/factories/product.factory";

describe("CategoryService", () => {
    let categoryService: CategoryService;
    let mockCategoryRepository: MockRepository<Category>;

    let mockCategory: Category;

    beforeEach(() => {
        mockCategoryRepository = createMockRepository<Category>();

        categoryService = new CategoryService(
            mockCategoryRepository as any
        );

        mockCategory = createMockCategory({
            id: 1,
            categoryId: "cat-123",
            name: "Electronics",
            description: "Electronic devices and gadgets",
        });
    });

    describe("getAllCategories", () => {
        it("should return paginated categories", async () => {
            const categories = [
                createMockCategory({ name: "Electronics" }),
                createMockCategory({ name: "Books" }),
            ];

            const mockQueryBuilder = {
                where: vi.fn().mockReturnThis(),
                orderBy: vi.fn().mockReturnThis(),
                skip: vi.fn().mockReturnThis(),
                take: vi.fn().mockReturnThis(),
                getManyAndCount: vi.fn().mockResolvedValue([categories, 2]),
            };

            mockCategoryRepository.createQueryBuilder.mockReturnValue(
                mockQueryBuilder as any
            );

            const result = await categoryService.getAllCategories({
                page: 1,
                limit: 10,
            });

            expect(result.data).toHaveLength(2);
            expect(result.total).toBe(2);
            expect(result.page).toBe(1);
            expect(result.limit).toBe(10);
            expect(result.totalPages).toBe(1);
        });

        it("should filter by search term", async () => {
            const mockQueryBuilder = {
                where: vi.fn().mockReturnThis(),
                orderBy: vi.fn().mockReturnThis(),
                skip: vi.fn().mockReturnThis(),
                take: vi.fn().mockReturnThis(),
                getManyAndCount: vi.fn().mockResolvedValue([[], 0]),
            };

            mockCategoryRepository.createQueryBuilder.mockReturnValue(
                mockQueryBuilder as any
            );

            await categoryService.getAllCategories({ search: "Electronics" });

            expect(mockQueryBuilder.where).toHaveBeenCalledWith(
                "(category.name ILIKE :search OR category.description ILIKE :search)",
                { search: "%Electronics%" }
            );
        });

        it("should use default pagination if not provided", async () => {
            const mockQueryBuilder = {
                where: vi.fn().mockReturnThis(),
                orderBy: vi.fn().mockReturnThis(),
                skip: vi.fn().mockReturnThis(),
                take: vi.fn().mockReturnThis(),
                getManyAndCount: vi.fn().mockResolvedValue([[], 0]),
            };

            mockCategoryRepository.createQueryBuilder.mockReturnValue(
                mockQueryBuilder as any
            );

            const result = await categoryService.getAllCategories();

            expect(result.page).toBe(1);
            expect(result.limit).toBe(10);
            expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
            expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
        });

        it("should order categories by name ascending", async () => {
            const mockQueryBuilder = {
                where: vi.fn().mockReturnThis(),
                orderBy: vi.fn().mockReturnThis(),
                skip: vi.fn().mockReturnThis(),
                take: vi.fn().mockReturnThis(),
                getManyAndCount: vi.fn().mockResolvedValue([[], 0]),
            };

            mockCategoryRepository.createQueryBuilder.mockReturnValue(
                mockQueryBuilder as any
            );

            await categoryService.getAllCategories();

            expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
                "category.name",
                "ASC"
            );
        });

        it("should calculate pagination correctly", async () => {
            const mockQueryBuilder = {
                where: vi.fn().mockReturnThis(),
                orderBy: vi.fn().mockReturnThis(),
                skip: vi.fn().mockReturnThis(),
                take: vi.fn().mockReturnThis(),
                getManyAndCount: vi.fn().mockResolvedValue([[], 25]),
            };

            mockCategoryRepository.createQueryBuilder.mockReturnValue(
                mockQueryBuilder as any
            );

            const result = await categoryService.getAllCategories({
                page: 2,
                limit: 10,
            });

            expect(result.totalPages).toBe(3);
            expect(mockQueryBuilder.skip).toHaveBeenCalledWith(10);
        });
    });

    describe("getCategoryById", () => {
        it("should return category by categoryId", async () => {
            mockCategoryRepository.findOneBy.mockResolvedValue(mockCategory);

            const result = await categoryService.getCategoryById("cat-123");

            expect(result).toEqual(mockCategory);
            expect(mockCategoryRepository.findOneBy).toHaveBeenCalledWith({
                categoryId: "cat-123",
            });
        });

        it("should throw NotFoundError if category not found", async () => {
            mockCategoryRepository.findOneBy.mockResolvedValue(null);

            await expect(
                categoryService.getCategoryById("missing-cat")
            ).rejects.toThrow(NotFoundError);
            await expect(
                categoryService.getCategoryById("missing-cat")
            ).rejects.toThrow("The requested category doesn't exist");
        });
    });

    describe("createCategory", () => {
        it("should create and return new category", async () => {
            const createDto = {
                name: "Home & Garden",
                description: "Home improvement and gardening supplies",
            };

            const newCategory = createMockCategory({
                ...createDto,
                categoryId: "cat-456",
            });

            mockCategoryRepository.create.mockReturnValue(newCategory);
            mockCategoryRepository.save.mockResolvedValue(newCategory);

            const result = await categoryService.createCategory(createDto);

            expect(result).toEqual(newCategory);
            expect(mockCategoryRepository.create).toHaveBeenCalledWith(createDto);
            expect(mockCategoryRepository.save).toHaveBeenCalledWith(newCategory);
        });

        it("should create category with nullable description", async () => {
            const createDto = {
                name: "Fashion",
            };

            const newCategory = createMockCategory({
                ...createDto,
                description: null as any,
            });

            mockCategoryRepository.create.mockReturnValue(newCategory);
            mockCategoryRepository.save.mockResolvedValue(newCategory);

            const result = await categoryService.createCategory(createDto);

            expect(result.name).toBe("Fashion");
            expect(mockCategoryRepository.create).toHaveBeenCalledWith(createDto);
        });
    });

    describe("updateCategory", () => {
        it("should update and return category", async () => {
            const updateDto = {
                name: "Electronics & Gadgets",
                description: "Updated description",
            };

            const updatedCategory = {
                ...mockCategory,
                ...updateDto,
            };

            mockCategoryRepository.findOneBy.mockResolvedValue(mockCategory);
            mockCategoryRepository.save.mockResolvedValue(updatedCategory);

            const result = await categoryService.updateCategory("cat-123", updateDto);

            expect(result.name).toBe("Electronics & Gadgets");
            expect(result.description).toBe("Updated description");
            expect(mockCategoryRepository.save).toHaveBeenCalled();
        });

        it("should throw NotFoundError if category not found", async () => {
            mockCategoryRepository.findOneBy.mockResolvedValue(null);

            await expect(
                categoryService.updateCategory("missing-cat", { name: "Test" })
            ).rejects.toThrow(NotFoundError);
        });

        it("should allow partial updates", async () => {
            const updateDto = {
                name: "Updated Name",
            };

            mockCategoryRepository.findOneBy.mockResolvedValue(mockCategory);
            mockCategoryRepository.save.mockResolvedValue({
                ...mockCategory,
                name: "Updated Name",
            });

            const result = await categoryService.updateCategory("cat-123", updateDto);

            expect(result.name).toBe("Updated Name");
            expect(result.description).toBe(mockCategory.description);
        });
    });

    describe("deleteCategory", () => {
        it("should delete category successfully if no products", async () => {
            const categoryWithoutProducts = createMockCategory({
                categoryId: "cat-123",
                products: [],
            });

            mockCategoryRepository.findOneBy.mockResolvedValue(categoryWithoutProducts);
            mockCategoryRepository.softRemove.mockResolvedValue(categoryWithoutProducts);

            const result = await categoryService.deleteCategory("cat-123");

            expect(result).toBe(true);
            expect(mockCategoryRepository.softRemove).toHaveBeenCalledWith(
                categoryWithoutProducts
            );
        });

        it("should throw NotFoundError if category not found", async () => {
            mockCategoryRepository.findOneBy.mockResolvedValue(null);

            await expect(
                categoryService.deleteCategory("missing-cat")
            ).rejects.toThrow(NotFoundError);
        });

        it("should throw BadRequestError if category has products", async () => {
            const product = createMockProduct({ id: 1, name: "Product 1" });
            const categoryWithProducts = createMockCategory({
                categoryId: "cat-123",
                products: [product],
            });

            mockCategoryRepository.findOneBy.mockResolvedValue(categoryWithProducts);

            await expect(
                categoryService.deleteCategory("cat-123")
            ).rejects.toThrow(BadRequestError);
            await expect(
                categoryService.deleteCategory("cat-123")
            ).rejects.toThrow("This category still has products");

            expect(mockCategoryRepository.softRemove).not.toHaveBeenCalled();
        });

        it("should use soft delete", async () => {
            const category = createMockCategory({
                categoryId: "cat-123",
                products: [],
            });

            mockCategoryRepository.findOneBy.mockResolvedValue(category);
            mockCategoryRepository.softRemove.mockResolvedValue(category);

            await categoryService.deleteCategory("cat-123");

            expect(mockCategoryRepository.softRemove).toHaveBeenCalledWith(category);
            expect(mockCategoryRepository.delete).not.toHaveBeenCalled();
        });
    });
});
