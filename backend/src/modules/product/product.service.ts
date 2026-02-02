import { Repository } from "typeorm";
import { Product } from "./entities/Product";
import {
  CreateProductDto,
  IProductService,
  ProductQueryParams,
  UpdateProductDto,
} from "./product.interface";
import { NotFoundError } from "@/shared/errors";
import { PaginatedResult } from "@/shared/interfaces/pagination";
import { ErrorMessages } from "@/shared/errors/messages";

export class ProductService implements IProductService {
  constructor(private readonly productRepository: Repository<Product>) { }

  private async findProductOrThrow(productId: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { productId },
      relations: ["category"],
    });
    if (!product) {
      throw new NotFoundError(ErrorMessages.PRODUCT_NOT_FOUND);
    }
    return product;
  }

  async getAllProducts(
    params: ProductQueryParams,
  ): Promise<PaginatedResult<Product>> {
    const {
      search,
      category,
      categoryId,
      isActive,
      inStock,
      minPrice,
      maxPrice,
      sort = "createdAt",
      order = "DESC",
      page = 1,
      limit = 10,
    } = params;
    const queryBuilder = this.productRepository
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.category", "category");

    if (search) {
      queryBuilder.andWhere(
        "(product.name ILIKE :search OR product.description ILIKE :search)",
        {
          search: `%${search}%`,
        },
      );
    }

    if (category) {
      queryBuilder.andWhere("category.name = :category", { category });
    }

    if (categoryId) {
      queryBuilder.andWhere("category.categoryId = :categoryId", { categoryId });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere("product.isActive = :isActive", { isActive });
    }

    if (inStock === true) {
      queryBuilder.andWhere("product.stock > 0");
    } else if (inStock === false) {
      queryBuilder.andWhere("product.stock = 0");
    }

    if (minPrice !== undefined) {
      queryBuilder.andWhere("product.price >= :minPrice", { minPrice });
    }
    if (maxPrice !== undefined) {
      queryBuilder.andWhere("product.price <= :maxPrice", { maxPrice });
    }

    queryBuilder.orderBy(`product.${sort}`, order);

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getProductByProductId(productId: string): Promise<Product> {
    return await this.findProductOrThrow(productId);
  }

  async createProduct(data: CreateProductDto): Promise<Product> {
    const { name, description, price, stock, imageUrl, categoryId, isActive } =
      data;

    const category = await this.productRepository.manager.findOne("Category" as any, {
      where: { categoryId }
    });

    if (!category) {
      throw new NotFoundError(ErrorMessages.CATEGORY_NOT_FOUND || "Category not found");
    }

    const product = this.productRepository.create({
      name,
      description,
      price,
      stock: stock || 0,
      imageUrl,
      category: category as any,
      isActive: isActive !== false,
    });
    return await this.productRepository.save(product);
  }

  async updateProduct(
    productId: string,
    data: UpdateProductDto,
  ): Promise<Product | null> {
    const product = await this.findProductOrThrow(productId);

    if (data.categoryId) {
      const category = await this.productRepository.manager.findOne("Category" as any, {
        where: { categoryId: data.categoryId }
      });
      if (!category) {
        throw new NotFoundError(ErrorMessages.CATEGORY_NOT_FOUND || "Category not found");
      }
      product.category = category as any;
      delete data.categoryId;
    }

    Object.assign(product, data);
    return this.productRepository.save(product);
  }

  async deleteProduct(productId: string): Promise<boolean> {
    const product = await this.findProductOrThrow(productId);
    await this.productRepository.softRemove(product);
    return true;
  }
}
