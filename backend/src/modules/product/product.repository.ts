import { Repository } from "typeorm";
import { BaseRepository } from "@/shared/repositories/BaseRepository";
import { IBaseRepository } from "@/shared/repositories/IBaseRepository";
import { Product } from "./entities/Product";
import { PaginatedResult } from "@/shared/interfaces/pagination";
import { ProductQueryParams } from "./product.interface";

/**
 * Product repository interface with domain-specific methods
 */
export interface IProductRepository extends IBaseRepository<Product> {
    findByProductId(productId: string): Promise<Product | null>;
    findByProductIdOrFail(productId: string): Promise<Product>;
    findByProductIdWithCategory(productId: string): Promise<Product | null>;
    findAllWithFilters(params: ProductQueryParams): Promise<PaginatedResult<Product>>;
    findActiveProducts(): Promise<Product[]>;
    findOutOfStockProducts(): Promise<Product[]>;
    decrementStock(productId: string, quantity: number): Promise<void>;
    incrementStock(productId: string, quantity: number): Promise<void>;
}

/**
 * Product repository implementation
 */
export class ProductRepository
    extends BaseRepository<Product>
    implements IProductRepository {
    constructor(repository: Repository<Product>) {
        super(repository);
    }

    protected getEntityName(): string {
        return "Product";
    }

    async findByProductId(productId: string): Promise<Product | null> {
        return this.findOne({ where: { productId } });
    }

    async findByProductIdOrFail(productId: string): Promise<Product> {
        return this.findOneOrFail({
            where: { productId },
            relations: ["category"],
        });
    }

    async findByProductIdWithCategory(productId: string): Promise<Product | null> {
        return this.findOne({
            where: { productId },
            relations: ["category"],
        });
    }

    async findAllWithFilters(
        params: ProductQueryParams = {}
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

        const queryBuilder = this.createQueryBuilder("product")
            .leftJoinAndSelect("product.category", "category");

        if (search) {
            queryBuilder.andWhere(
                "(product.name ILIKE :search OR product.description ILIKE :search)",
                { search: `%${search}%` }
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

    async findActiveProducts(): Promise<Product[]> {
        return this.find({
            where: { isActive: true },
            relations: ["category"],
        });
    }

    async findOutOfStockProducts(): Promise<Product[]> {
        return this.createQueryBuilder("product")
            .where("product.stock = 0")
            .leftJoinAndSelect("product.category", "category")
            .getMany();
    }

    async decrementStock(productId: string, quantity: number): Promise<void> {
        await this.createQueryBuilder()
            .update(Product)
            .set({ stock: () => `stock - ${quantity}` })
            .where("productId = :productId", { productId })
            .execute();
    }

    async incrementStock(productId: string, quantity: number): Promise<void> {
        await this.createQueryBuilder()
            .update(Product)
            .set({ stock: () => `stock + ${quantity}` })
            .where("productId = :productId", { productId })
            .execute();
    }
}
