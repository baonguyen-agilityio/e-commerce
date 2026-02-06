import { Product } from "./entities/Product";
import { Category } from "@modules/category/entities/Category";
import {
  CreateProductDto,
  IProductService,
  ProductQueryParams,
  UpdateProductDto,
} from "./product.interface";
import { NotFoundError } from "@/shared/errors";
import { PaginatedResult } from "@/shared/interfaces/pagination";
import { ErrorMessages } from "@/shared/errors/messages";
import { IProductRepository } from "./product.repository";
import { ICategoryRepository } from "@modules/category/category.repository";

export class ProductService implements IProductService {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly categoryRepository: ICategoryRepository,
  ) { }

  async getAllProducts(
    params: ProductQueryParams,
  ): Promise<PaginatedResult<Product>> {
    return this.productRepository.findAllWithFilters(params);
  }

  async getProductByProductId(productId: string): Promise<Product> {
    return await this.productRepository.findByProductIdOrFail(productId);
  }

  async createProduct(data: CreateProductDto): Promise<Product> {
    const { name, description, price, stock, imageUrl, categoryId, isActive } =
      data;

    const category = await this.categoryRepository.findByCategoryIdOrFail(categoryId);

    const product = this.productRepository.create({
      name,
      description,
      price,
      stock: stock || 0,
      imageUrl,
      category,
      isActive: isActive !== false,
    });
    return await this.productRepository.save(product);
  }

  async updateProduct(
    productId: string,
    data: UpdateProductDto,
  ): Promise<Product | null> {
    const product = await this.productRepository.findByProductIdOrFail(productId);

    if (data.categoryId) {
      const category = await this.categoryRepository.findByCategoryIdOrFail(data.categoryId);
      product.category = category;
      delete data.categoryId;
    }

    Object.assign(product, data);
    return this.productRepository.save(product);
  }

  async deleteProduct(productId: string): Promise<boolean> {
    const product = await this.productRepository.findByProductIdOrFail(productId);
    await this.productRepository.softRemove(product);
    return true;
  }
}
