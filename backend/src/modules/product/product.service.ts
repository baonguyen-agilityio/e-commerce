import { Repository } from "typeorm";
import { Product } from "./entities/Product";
import {
  CreateProductDto,
  IProductService,
  ProductQueryParams,
  UpdateProductDto,
} from "./product.interface";
import { NotFoundError } from "../../shared/errors";
import { PaginatedResult } from "../../shared/interfaces/pagination";
import { ErrorMessages } from "../../shared/errors/messages";

export class ProductService implements IProductService {
  constructor(private readonly productRepository: Repository<Product>) {}

  private async findProductOrThrow(id: number): Promise<Product> {
    const product = await this.productRepository.findOneBy({ id });
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

  async getProductById(id: number): Promise<Product> {
    return await this.findProductOrThrow(id);
  }

  async createProduct(data: CreateProductDto): Promise<Product> {
    const { name, description, price, stock, imageUrl, categoryId, isActive } =
      data;
    const product = this.productRepository.create({
      name,
      description,
      price,
      stock: stock || 0,
      imageUrl,
      categoryId,
      isActive: isActive !== false,
    });
    return await this.productRepository.save(product);
  }

  async updateProduct(
    id: number,
    data: UpdateProductDto,
  ): Promise<Product | null> {
    const product = await this.findProductOrThrow(id);
    Object.assign(product, data);
    return this.productRepository.save(product);
  }

  async deleteProduct(id: number): Promise<boolean> {
    const product = await this.findProductOrThrow(id);
    await this.productRepository.delete(product.id);
    return true;
  }
}
