import { describe, it, expect, vi, beforeEach } from "vitest";
import { ProductService } from "../product.service";
import {
  createMockRepository,
  MockRepository,
} from "../../../test/mocks/repository.mock";
import { Product } from "../entities/Product";
import { NotFoundError } from "../../../shared/errors";

describe("ProductService", () => {
  let productService: ProductService;
  let mockProductRepository: MockRepository<Product>;

  const mockProduct: Partial<Product> = {
    id: 1,
    name: "Test Product",
    description: "Test Description",
    price: 99.99,
    stock: 10,
    isActive: true,
    categoryId: 1,
    createdAt: new Date(),
  };

  beforeEach(() => {
    mockProductRepository = createMockRepository<Product>();
    productService = new ProductService(mockProductRepository as any);
  });

  describe("getProductById", () => {
    it("should return product when found", async () => {
      mockProductRepository.findOneBy.mockResolvedValue(mockProduct);

      const result = await productService.getProductById(1);

      expect(result).toEqual(mockProduct);
      expect(mockProductRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });

    it("should throw NotFoundError when product not found", async () => {
      mockProductRepository.findOneBy.mockResolvedValue(null);

      await expect(productService.getProductById(999)).rejects.toThrow(
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
        categoryId: 1,
      };

      mockProductRepository.create.mockReturnValue({ ...createDto, id: 2 });
      mockProductRepository.save.mockResolvedValue({ ...createDto, id: 2 });

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
        categoryId: 1,
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
      mockProductRepository.findOneBy.mockResolvedValue(mockProduct);
      mockProductRepository.save.mockResolvedValue({
        ...mockProduct,
        ...updateDto,
      });

      const result = await productService.updateProduct(1, updateDto);

      expect(result?.name).toBe("Updated Name");
    });

    it("should throw NotFoundError when product not found", async () => {
      mockProductRepository.findOneBy.mockResolvedValue(null);

      await expect(
        productService.updateProduct(999, { name: "Test" }),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("deleteProduct", () => {
    it("should delete product and return true", async () => {
      mockProductRepository.findOneBy.mockResolvedValue(mockProduct);
      mockProductRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await productService.deleteProduct(1);

      expect(result).toBe(true);
      expect(mockProductRepository.delete).toHaveBeenCalledWith(1);
    });
  });

  describe("getAllProducts", () => {
    it("should return paginated products", async () => {
      const mockProducts = [mockProduct];
      const mockQueryBuilder = {
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        getManyAndCount: vi.fn().mockResolvedValue([mockProducts, 1]),
      };
      mockProductRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
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
      const mockQueryBuilder = {
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        getManyAndCount: vi.fn().mockResolvedValue([[], 0]),
      };
      mockProductRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
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
