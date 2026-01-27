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

  private async findProductOrThrow(publicId: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { publicId },
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
      categoryPublicId,
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

    if (categoryPublicId) {
      queryBuilder.andWhere("category.publicId = :categoryPublicId", { categoryPublicId });
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

  async getProductByPublicId(publicId: string): Promise<Product> {
    return await this.findProductOrThrow(publicId);
  }

  async createProduct(data: CreateProductDto): Promise<Product> {
    const { name, description, price, stock, imageUrl, categoryPublicId, isActive } =
      data;

    const category = await this.productRepository.manager.findOne("Category" as any, {
      where: { publicId: categoryPublicId }
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
    publicId: string,
    data: UpdateProductDto,
  ): Promise<Product | null> {
    const product = await this.findProductOrThrow(publicId);

    if (data.categoryPublicId) {
      const category = await this.productRepository.manager.findOne("Category" as any, {
        where: { publicId: data.categoryPublicId }
      });
      if (!category) {
        throw new NotFoundError(ErrorMessages.CATEGORY_NOT_FOUND || "Category not found");
      }
      product.category = category as any;
      delete data.categoryPublicId;
    }

    Object.assign(product, data);
    return this.productRepository.save(product);
  }

  async deleteProduct(publicId: string): Promise<boolean> {
    const product = await this.findProductOrThrow(publicId);
    await this.productRepository.softRemove(product);
    return true;
  }
}
