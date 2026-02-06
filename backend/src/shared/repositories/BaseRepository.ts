import {
    Repository,
    FindOptionsWhere,
    FindManyOptions,
    FindOneOptions,
    DeepPartial,
    ObjectLiteral,
} from "typeorm";
import { IBaseRepository } from "./IBaseRepository";
import { NotFoundError } from "@/shared/errors";

/**
 * Base repository implementation providing common CRUD operations
 * All domain repositories should extend this class
 */
export abstract class BaseRepository<T extends ObjectLiteral> implements IBaseRepository<T> {
    constructor(protected readonly repository: Repository<T>) { }

    /**
     * Get the entity name for error messages
     */
    protected abstract getEntityName(): string;

    async findById(id: number): Promise<T | null> {
        return this.repository.findOne({
            where: { id } as unknown as FindOptionsWhere<T>,
        });
    }

    async findOne(options: FindOneOptions<T>): Promise<T | null> {
        return this.repository.findOne(options);
    }

    async findOneOrFail(options: FindOneOptions<T>): Promise<T> {
        const entity = await this.repository.findOne(options);
        if (!entity) {
            throw new NotFoundError(`${this.getEntityName()} not found`);
        }
        return entity;
    }

    async find(options?: FindManyOptions<T>): Promise<T[]> {
        return this.repository.find(options);
    }

    async findAndCount(options?: FindManyOptions<T>): Promise<[T[], number]> {
        return this.repository.findAndCount(options);
    }

    async count(where?: FindOptionsWhere<T>): Promise<number> {
        return this.repository.count({ where });
    }

    create(data: DeepPartial<T>): T {
        return this.repository.create(data);
    }

    async save(entity: T): Promise<T> {
        return this.repository.save(entity);
    }

    async saveMany(entities: T[]): Promise<T[]> {
        return this.repository.save(entities);
    }

    async update(id: number, data: DeepPartial<T>): Promise<void> {
        await this.repository.update(id, data as any);
    }

    async delete(id: number): Promise<void> {
        await this.repository.delete(id);
    }

    async softDelete(id: number): Promise<void> {
        await this.repository.softDelete(id);
    }

    async softRemove(entity: T): Promise<T> {
        return this.repository.softRemove(entity);
    }

    async recover(entity: T): Promise<T> {
        return this.repository.recover(entity);
    }

    async exists(where: FindOptionsWhere<T>): Promise<boolean> {
        const count = await this.repository.count({ where });
        return count > 0;
    }

    /**
     * Get the underlying TypeORM repository for advanced queries
     * Use sparingly - prefer adding methods to the repository instead
     */
    protected getRepository(): Repository<T> {
        return this.repository;
    }

    /**
     * Create a query builder for complex queries
     */
    protected createQueryBuilder(alias?: string) {
        return this.repository.createQueryBuilder(alias);
    }
}
