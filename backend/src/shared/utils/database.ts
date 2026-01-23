import { DataSource, EntityManager } from 'typeorm';

/**
 * Executes a function within a database transaction.
 * If the function throws an error, the transaction is automatically rolled back.
 * @param dataSource The TypeORM DataSource
 * @param fn The function to execute within the transaction
 */
export async function withTransaction<T>(
    dataSource: DataSource,
    fn: (manager: EntityManager) => Promise<T>
): Promise<T> {
    return await dataSource.transaction(async (manager) => {
        return await fn(manager);
    });
}
