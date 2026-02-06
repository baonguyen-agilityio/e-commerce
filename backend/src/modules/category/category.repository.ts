import { Repository } from "typeorm";
import { BaseRepository } from "@/shared/repositories/BaseRepository";
import { IBaseRepository } from "@/shared/repositories/IBaseRepository";
import { Category } from "./entities/Category";
import { CategoryQueryParams } from "./category.interface";
import { PaginatedResult } from "@/shared/interfaces/pagination";

export interface ICategoryRepository extends IBaseRepository<Category> {
    findByCategoryId(categoryId: string): Promise<Category | null>;
    findByCategoryIdOrFail(categoryId: string): Promise<Category>;
    findByName(name: string): Promise<Category | null>;
    findAll(params: CategoryQueryParams): Promise<PaginatedResult<Category>>;
    existsByName(name: string): Promise<boolean>;
    hasProducts(categoryId: string): Promise<boolean>;
}

export class CategoryRepository
    extends BaseRepository<Category>
    implements ICategoryRepository {
    constructor(repository: Repository<Category>) {
        super(repository);
    }

    protected getEntityName(): string {
        return "Category";
    }

    async findByCategoryId(categoryId: string): Promise<Category | null> {
        return this.findOne({ where: { categoryId } });
    }

    async findByCategoryIdOrFail(categoryId: string): Promise<Category> {
        return this.findOneOrFail({ where: { categoryId } });
    }

    async findByName(name: string): Promise<Category | null> {
        return this.findOne({ where: { name } });
    }

    async findAll(params: CategoryQueryParams): Promise<PaginatedResult<Category>> {
        const page = params.page || 1;
        const limit = params.limit || 10;
        const skip = (page - 1) * limit;

        const queryBuilder = this.createQueryBuilder("category");

        if (params.search) {
            queryBuilder.where(
                "(category.name ILIKE :search OR category.description ILIKE :search)",
                { search: `%${params.search}%` }
            );
        }

        queryBuilder.orderBy("category.name", "ASC").skip(skip).take(limit);

        const [data, total] = await queryBuilder.getManyAndCount();

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async existsByName(name: string): Promise<boolean> {
        return this.exists({ name });
    }

    async hasProducts(categoryId: string): Promise<boolean> {
        const count = await this.createQueryBuilder("category")
            .innerJoin("category.products", "product")
            .where("category.categoryId = :categoryId", { categoryId })
            .getCount();
        return count > 0;
    }
}
