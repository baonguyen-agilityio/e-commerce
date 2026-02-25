import { describe, it, expect, vi, beforeEach } from "vitest";
import { ProductService } from "../product.service";
import { createMockRepository, MockRepository } from "@/test/mocks/repository.mock";
import { Product } from "../entities/Product";
import { Category } from "@modules/category/entities/Category";
import { NotFoundError } from "@/shared/errors";
import { createMockProduct } from "@/test/factories/product.factory";

type ProductRepositoryMock = MockRepository<Product> & {
  findByProductIdOrFail: ReturnType<typeof vi.fn>;
  findAllWithFilters: ReturnType<typeof vi.fn>;
};

type CategoryRepositoryMock = MockRepository<Category> & {
  findByCategoryIdOrFail: ReturnType<typeof vi.fn>;
};

describe("ProductService", () => {
  let productService: ProductService;
  let mockProductRepository: ProductRepositoryMock;
  let mockCategoryRepository: CategoryRepositoryMock;

  const mockProduct = createMockProduct({ productId: "prod-1" });

  beforeEach(() => {
    mockProductRepository = {
      ...createMockRepository<Product>(),
      findByProductIdOrFail: vi.fn(),
      findAllWithFilters: vi.fn(),
    };
    mockCategoryRepository = {
      ...createMockRepository<Category>(),
      findByCategoryIdOrFail: vi.fn(),
    };
    productService = new ProductService(
      mockProductRepository as any,
      mockCategoryRepository as any,
    );
  });

  describe("getProductByProductId", () => {
    it("should return product when found", async () => {
      mockProductRepository.findByProductIdOrFail.mockResolvedValue(mockProduct);

      const result = await productService.getProductByProductId("prod-1");

      expect(result).toEqual(mockProduct);
      expect(mockProductRepository.findByProductIdOrFail).toHaveBeenCalledWith(
        "prod-1",
      );
    });

    it("should throw NotFoundError when product not found", async () => {
      mockProductRepository.findByProductIdOrFail.mockRejectedValue(
        new NotFoundError("Product not found"),
      );

      await expect(
        productService.getProductByProductId("missing-999"),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("createProduct", () => {
    it("should create and return new product", async () => {
      const createDto = {
        name: "New Product",
        description: "New Description",
        price: 49.99,
        stock: 5,
        categoryId: "cat-1",
      };

      const mockCategory = { id: 1, categoryId: "cat-1", name: "Test Category" };

      mockCategoryRepository.findByCategoryIdOrFail.mockResolvedValue(
        mockCategory as any,
      );
      mockProductRepository.create.mockReturnValue({
        ...createDto,
        productId: "prod-2",
      });
      mockProductRepository.save.mockResolvedValue({
        ...createDto,
        productId: "prod-2",
      });

      const result = await productService.createProduct(createDto);

      expect(mockCategoryRepository.findByCategoryIdOrFail).toHaveBeenCalledWith(
        "cat-1",
      );
      expect(mockProductRepository.create).toHaveBeenCalled();
      expect(mockProductRepository.save).toHaveBeenCalled();
      expect(result.name).toBe(createDto.name);
    });

    it("should set isActive to true by default", async () => {
      const createDto = {
        name: "New Product",
        description: "Desc",
        price: 10,
        categoryId: "cat-1",
      };

      const mockCategory = { id: 1, categoryId: "cat-1", name: "Test Category" };

      mockCategoryRepository.findByCategoryIdOrFail.mockResolvedValue(
        mockCategory as any,
      );
      mockProductRepository.create.mockImplementation((data) => data);
      mockProductRepository.save.mockImplementation((data) => Promise.resolve(data));

      await productService.createProduct(createDto);

      expect(mockProductRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ isActive: true }),
      );
    });
  });

  describe("updateProduct", () => {
    it("should update and return product", async () => {
      const updateDto = { name: "Updated Name" };
      mockProductRepository.findByProductIdOrFail.mockResolvedValue(mockProduct);
      mockProductRepository.save.mockResolvedValue({
        ...mockProduct,
        ...updateDto,
      });

      const result = await productService.updateProduct("prod-1", updateDto);

      expect(result?.name).toBe("Updated Name");
      expect(mockProductRepository.findByProductIdOrFail).toHaveBeenCalledWith(
        "prod-1",
      );
    });

    it("should throw NotFoundError when product not found", async () => {
      mockProductRepository.findByProductIdOrFail.mockRejectedValue(
        new NotFoundError("Product not found"),
      );

      await expect(
        productService.updateProduct("missing-999", { name: "Test" }),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("deleteProduct", () => {
    it("should delete product and return true", async () => {
      mockProductRepository.findByProductIdOrFail.mockResolvedValue(mockProduct);
      mockProductRepository.softRemove.mockResolvedValue(mockProduct);

      const result = await productService.deleteProduct("prod-1");

      expect(result).toBe(true);
      expect(mockProductRepository.softRemove).toHaveBeenCalled();
    });
  });

  describe("getAllProducts", () => {
    it("should return paginated products", async () => {
      const paginatedResult = {
        data: [mockProduct],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
      mockProductRepository.findAllWithFilters.mockResolvedValue(paginatedResult);

      const result = await productService.getAllProducts({
        page: 1,
        limit: 10,
      });

      expect(result).toEqual(paginatedResult);
      expect(mockProductRepository.findAllWithFilters).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
      });
    });

    it("should apply search filter", async () => {
      mockProductRepository.findAllWithFilters.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });

      await productService.getAllProducts({
        search: "test",
        page: 1,
        limit: 10,
      });

      expect(mockProductRepository.findAllWithFilters).toHaveBeenCalledWith({
        search: "test",
        page: 1,
        limit: 10,
      });
    });
  });
});
