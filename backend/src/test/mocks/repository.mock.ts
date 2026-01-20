import { vi } from "vitest";

// Helper to create a chainable query builder mock
export const createMockQueryBuilder = <T>(results: T[] = [], count = 0) => {
  const qb = {
    leftJoinAndSelect: vi.fn().mockReturnThis(),
    andWhere: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    skip: vi.fn().mockReturnThis(),
    take: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    addSelect: vi.fn().mockReturnThis(),
    // Allow defining return values for the final execution
    getManyAndCount: vi.fn().mockResolvedValue([results, count]),
    getOne: vi.fn().mockResolvedValue(results[0] || null),
    getMany: vi.fn().mockResolvedValue(results),
  };
  return qb;
};

export const createMockRepository = <T>() => ({
  find: vi.fn(),
  findOne: vi.fn(),
  findOneBy: vi.fn(),
  save: vi.fn(),
  create: vi.fn(),
  delete: vi.fn(),
  update: vi.fn(),
  count: vi.fn(),
  // Returns a new QueryBuilder mock instance
  createQueryBuilder: vi.fn(() => createMockQueryBuilder<T>()),
});

export type MockRepository<T> = ReturnType<typeof createMockRepository<T>>;
