import { describe, it, expect, vi, beforeEach } from "vitest";
import { CategoryService } from "../category.service";
import { Category } from "../entities/Category";
import {
  createMockRepository,
  MockRepository,
} from "@/test/mocks/repository.mock";
import { BadRequestError, NotFoundError } from "@/shared/errors";
import { ErrorMessages } from "@/shared/errors/messages";
import { createMockCategory } from "@/test/factories/category.factory";

type CategoryRepositoryMock = MockRepository<Category> & {
  findAll: ReturnType<typeof vi.fn>;
  findByCategoryIdOrFail: ReturnType<typeof vi.fn>;
  hasProducts: ReturnType<typeof vi.fn>;
};

describe("CategoryService", () => {
  let categoryService: CategoryService;
  let mockCategoryRepository: CategoryRepositoryMock;

  let mockCategory: Category;

  beforeEach(() => {
    mockCategoryRepository = {
      ...createMockRepository<Category>(),
      findAll: vi.fn(),
      findByCategoryIdOrFail: vi.fn(),
      hasProducts: vi.fn(),
    };

    categoryService = new CategoryService(mockCategoryRepository as any);

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
      const paginatedResult = {
        data: categories,
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      mockCategoryRepository.findAll.mockResolvedValue(paginatedResult);

      const result = await categoryService.getAllCategories({
        page: 1,
        limit: 10,
      });

      expect(result).toEqual(paginatedResult);
      expect(mockCategoryRepository.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
      });
    });

    it("should forward search params to repository", async () => {
      mockCategoryRepository.findAll.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });

      await categoryService.getAllCategories({ search: "Electronics" });

      expect(mockCategoryRepository.findAll).toHaveBeenCalledWith({
        search: "Electronics",
      });
    });

    it("should use default params when none provided", async () => {
      const defaultResult = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };
      mockCategoryRepository.findAll.mockResolvedValue(defaultResult);

      const result = await categoryService.getAllCategories();

      expect(result).toEqual(defaultResult);
      expect(mockCategoryRepository.findAll).toHaveBeenCalledWith({});
    });

    it("should return pagination values from repository", async () => {
      const paginatedResult = {
        data: [],
        total: 25,
        page: 2,
        limit: 10,
        totalPages: 3,
      };
      mockCategoryRepository.findAll.mockResolvedValue(paginatedResult);

      const result = await categoryService.getAllCategories({
        page: 2,
        limit: 10,
      });

      expect(result.totalPages).toBe(3);
      expect(result.total).toBe(25);
      expect(result.page).toBe(2);
    });
  });

  describe("getCategoryById", () => {
    it("should return category by categoryId", async () => {
      mockCategoryRepository.findByCategoryIdOrFail.mockResolvedValue(mockCategory);

      const result = await categoryService.getCategoryById("cat-123");

      expect(result).toEqual(mockCategory);
      expect(mockCategoryRepository.findByCategoryIdOrFail).toHaveBeenCalledWith(
        "cat-123",
      );
    });

    it("should throw NotFoundError if category not found", async () => {
      mockCategoryRepository.findByCategoryIdOrFail.mockRejectedValue(
        new NotFoundError("Category not found"),
      );

      await expect(categoryService.getCategoryById("missing-cat")).rejects.toThrow(
        NotFoundError,
      );
      await expect(categoryService.getCategoryById("missing-cat")).rejects.toThrow(
        "Category not found",
      );
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

      mockCategoryRepository.findByCategoryIdOrFail.mockResolvedValue(mockCategory);
      mockCategoryRepository.save.mockResolvedValue(updatedCategory);

      const result = await categoryService.updateCategory("cat-123", updateDto);

      expect(result.name).toBe("Electronics & Gadgets");
      expect(result.description).toBe("Updated description");
      expect(mockCategoryRepository.findByCategoryIdOrFail).toHaveBeenCalledWith(
        "cat-123",
      );
      expect(mockCategoryRepository.save).toHaveBeenCalled();
    });

    it("should throw NotFoundError if category not found", async () => {
      mockCategoryRepository.findByCategoryIdOrFail.mockRejectedValue(
        new NotFoundError("Category not found"),
      );

      await expect(
        categoryService.updateCategory("missing-cat", { name: "Test" }),
      ).rejects.toThrow(NotFoundError);
    });

    it("should allow partial updates", async () => {
      const updateDto = {
        name: "Updated Name",
      };

      mockCategoryRepository.findByCategoryIdOrFail.mockResolvedValue(mockCategory);
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
      });

      mockCategoryRepository.findByCategoryIdOrFail.mockResolvedValue(
        categoryWithoutProducts,
      );
      mockCategoryRepository.hasProducts.mockResolvedValue(false);
      mockCategoryRepository.softRemove.mockResolvedValue(categoryWithoutProducts);

      const result = await categoryService.deleteCategory("cat-123");

      expect(result).toBe(true);
      expect(mockCategoryRepository.hasProducts).toHaveBeenCalledWith("cat-123");
      expect(mockCategoryRepository.softRemove).toHaveBeenCalledWith(
        categoryWithoutProducts,
      );
    });

    it("should throw NotFoundError if category not found", async () => {
      mockCategoryRepository.findByCategoryIdOrFail.mockRejectedValue(
        new NotFoundError("Category not found"),
      );

      await expect(categoryService.deleteCategory("missing-cat")).rejects.toThrow(
        NotFoundError,
      );
    });

    it("should throw BadRequestError if category has products", async () => {
      mockCategoryRepository.findByCategoryIdOrFail.mockResolvedValue(mockCategory);
      mockCategoryRepository.hasProducts.mockResolvedValue(true);

      await expect(categoryService.deleteCategory("cat-123")).rejects.toThrow(
        BadRequestError,
      );
      await expect(categoryService.deleteCategory("cat-123")).rejects.toThrow(
        ErrorMessages.CATEGORY_HAS_PRODUCTS,
      );

      expect(mockCategoryRepository.softRemove).not.toHaveBeenCalled();
    });

    it("should use soft delete", async () => {
      mockCategoryRepository.findByCategoryIdOrFail.mockResolvedValue(mockCategory);
      mockCategoryRepository.hasProducts.mockResolvedValue(false);
      mockCategoryRepository.softRemove.mockResolvedValue(mockCategory);

      await categoryService.deleteCategory("cat-123");

      expect(mockCategoryRepository.softRemove).toHaveBeenCalledWith(mockCategory);
      expect(mockCategoryRepository.delete).not.toHaveBeenCalled();
    });
  });
});
