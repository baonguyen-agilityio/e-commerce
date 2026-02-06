import { FindOptionsWhere, FindManyOptions, FindOneOptions, DeepPartial, ObjectLiteral } from "typeorm";

/**
 * Base repository interface defining common CRUD operations
 * All domain repositories should extend this interface
 */
export interface IBaseRepository<T extends ObjectLiteral> {
    /**
     * Find a single entity by id
     */
    findById(id: number): Promise<T | null>;

    /**
     * Find a single entity by any criteria
     */
    findOne(options: FindOneOptions<T>): Promise<T | null>;

    /**
     * Find a single entity by criteria or throw error
     */
    findOneOrFail(options: FindOneOptions<T>): Promise<T>;

    /**
     * Find multiple entities
     */
    find(options?: FindManyOptions<T>): Promise<T[]>;

    /**
     * Find entities and count total
     */
    findAndCount(options?: FindManyOptions<T>): Promise<[T[], number]>;

    /**
     * Count entities matching criteria
     */
    count(where?: FindOptionsWhere<T>): Promise<number>;

    /**
     * Create a new entity instance (not saved to DB yet)
     */
    create(data: DeepPartial<T>): T;

    /**
     * Save entity to database
     */
    save(entity: T): Promise<T>;

    /**
     * Save multiple entities to database
     */
    saveMany(entities: T[]): Promise<T[]>;

    /**
     * Update entity by id
     */
    update(id: number, data: DeepPartial<T>): Promise<void>;

    /**
     * Delete entity by id (hard delete)
     */
    delete(id: number): Promise<void>;

    /**
     * Soft delete entity by id
     */
    softDelete(id: number): Promise<void>;

    /**
     * Soft remove entity instance
     */
    softRemove(entity: T): Promise<T>;

    /**
     * Recover soft-deleted entity
     */
    recover(entity: T): Promise<T>;

    /**
     * Check if entity exists
     */
    exists(where: FindOptionsWhere<T>): Promise<boolean>;
}
