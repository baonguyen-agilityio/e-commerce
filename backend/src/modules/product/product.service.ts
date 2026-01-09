import { Repository } from "typeorm";
import { Product } from "./entities/Product";
import {
  CreateProductDto,
  IProductService,
  PaginatedResult,
  ProductQueryParams,
  UpdateProductDto,
} from "./product.interface";
import { AppError } from "../../shared/middleware/errorHandler";

export class ProductService implements IProductService {
  constructor(private readonly productRepository: Repository<Product>) {}

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
    const queryBuilder = this.productRepository.createQueryBuilder("product");

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

  async getProductById(id: number): Promise<Product | null> {
    const existingProduct = await this.productRepository.findOneBy({ id });
    if (!existingProduct) {
      throw new AppError(404, "Product not found");
    }
    return await this.productRepository.findOneBy({ id });
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
    const existingProduct = await this.productRepository.findOneBy({ id });
    if (!existingProduct) {
      throw new AppError(404, "Product not found");
    }

    Object.assign(existingProduct, data);
    return this.productRepository.save(existingProduct);
  }

  async deleteProduct(id: number): Promise<boolean> {
    const existingProduct = await this.productRepository.findOneBy({ id });
    if (!existingProduct) {
      throw new AppError(404, "Product not found");
    }

    await this.productRepository.delete(id);
    return true;
  }
}
