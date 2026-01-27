import { describe, it, expect, vi, beforeEach } from "vitest";
import { ProductService } from "../product.service";
import {
  createMockRepository,
  createMockQueryBuilder,
  MockRepository,
} from "@/test/mocks/repository.mock";
import { Product } from "../entities/Product";
import { NotFoundError } from "@/shared/errors";
import { createMockProduct } from "@/test/factories/product.factory";

describe("ProductService", () => {
  let productService: ProductService;
  let mockProductRepository: MockRepository<Product>;

  const mockProduct = createMockProduct({ publicId: "prod-1" });

  beforeEach(() => {
    mockProductRepository = createMockRepository<Product>();
    productService = new ProductService(mockProductRepository as any);
  });

  describe("getProductByPublicId", () => {
    it("should return product when found", async () => {
      mockProductRepository.findOne.mockResolvedValue(mockProduct);

      const result = await productService.getProductByPublicId("prod-1");

      expect(result).toEqual(mockProduct);
      expect(mockProductRepository.findOne).toHaveBeenCalledWith(expect.objectContaining({
        where: { publicId: "prod-1" }
      }));
    });

    it("should throw NotFoundError when product not found", async () => {
      mockProductRepository.findOne.mockResolvedValue(null);

      await expect(productService.getProductByPublicId("missing-999")).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe("createProduct", () => {
    it("should create and return new product", async () => {
      const createDto = {
        name: "New Product",
        description: "New Description",
        price: 49.99,
        stock: 5,
        categoryPublicId: "cat-1",
      };

      mockProductRepository.create.mockReturnValue({ ...createDto, publicId: "prod-2" });
      mockProductRepository.save.mockResolvedValue({ ...createDto, publicId: "prod-2" });

      const result = await productService.createProduct(createDto);

      expect(mockProductRepository.create).toHaveBeenCalled();
      expect(mockProductRepository.save).toHaveBeenCalled();
      expect(result.name).toBe(createDto.name);
    });

    it("should set isActive to true by default", async () => {
      const createDto = {
        name: "New Product",
        description: "Desc",
        price: 10,
        categoryPublicId: "cat-1",
      };

      mockProductRepository.create.mockImplementation((data) => data);
      mockProductRepository.save.mockImplementation((data) =>
        Promise.resolve(data),
      );

      await productService.createProduct(createDto);

      expect(mockProductRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ isActive: true }),
      );
    });
  });

  describe("updateProduct", () => {
    it("should update and return product", async () => {
      const updateDto = { name: "Updated Name" };
      mockProductRepository.findOne.mockResolvedValue(mockProduct);
      mockProductRepository.save.mockResolvedValue({
        ...mockProduct,
        ...updateDto,
      });

      const result = await productService.updateProduct("prod-1", updateDto);

      expect(result?.name).toBe("Updated Name");
    });

    it("should throw NotFoundError when product not found", async () => {
      mockProductRepository.findOne.mockResolvedValue(null);

      await expect(
        productService.updateProduct("missing-999", { name: "Test" }),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("deleteProduct", () => {
    it("should delete product and return true", async () => {
      mockProductRepository.findOne.mockResolvedValue(mockProduct);
      mockProductRepository.softRemove.mockResolvedValue(mockProduct);

      const result = await productService.deleteProduct("prod-1");

      expect(result).toBe(true);
      expect(mockProductRepository.softRemove).toHaveBeenCalled();
    });
  });

  describe("getAllProducts", () => {
    it("should return paginated products", async () => {
      const mockProducts = [mockProduct];
      const mockQueryBuilder = createMockQueryBuilder(mockProducts, 1);

      mockProductRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any,
      );

      const result = await productService.getAllProducts({
        page: 1,
        limit: 10,
      });

      expect(result.data).toEqual(mockProducts);
      expect(result.total).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it("should apply search filter", async () => {
      const mockQueryBuilder = createMockQueryBuilder([], 0);
      mockProductRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any,
      );

      await productService.getAllProducts({
        search: "test",
        page: 1,
        limit: 10,
      });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        "(product.name ILIKE :search OR product.description ILIKE :search)",
        { search: "%test%" },
      );
    });
  });
});
