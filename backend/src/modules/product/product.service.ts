import { Repository } from "typeorm";
import { Product } from "./entities/Product";
import {
  IProductService,
  PaginatedResult,
  ProductQueryParams,
} from "./product.interface";

export class ProductService implements IProductService {
  constructor(private readonly productRepository: Repository<Product>) {}

  async getAllProducts(
    params: ProductQueryParams,
  ): Promise<PaginatedResult<Product>> {
    const {
      search,
      minPrice,
      maxPrice,
      sort = 'createdAt',
      order = 'DESC',
      page = 1,
      limit = 10,
    } = params;
    const queryBuilder = this.productRepository.createQueryBuilder("product");

    if (search) {
      queryBuilder.andWhere('(product.name ILIKE :search OR product.description ILIKE :search)', {
        search: `%${search}%`,
      });
    }

    if (minPrice !== undefined) {
      queryBuilder.andWhere('product.price >= :minPrice', { minPrice });
    }
    if (maxPrice !== undefined) {
      queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice });
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

//   async getProductById(id: string) {
//     return await this.productRepository.findOneBy({ id });
//   }

//   async createProduct(data: any) {
//     const product = this.productRepository.create(data);
//     return await this.productRepository.save(product);
//   }

//   async updateProduct(id: string, data: any) {
//     await this.productRepository.update(id, data);
//     return await this.productRepository.findOneBy({ id });
//   }

//   async deleteProduct(id: string) {
//     await this.productRepository.delete(id);
//   }
}
