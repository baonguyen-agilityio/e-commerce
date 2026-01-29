import { vi } from "vitest";

export const createMockQueryBuilder = <T>(results: T[] = [], count = 0) => {
  const qb = {
    leftJoinAndSelect: vi.fn().mockReturnThis(),
    andWhere: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    addOrderBy: vi.fn().mockReturnThis(),
    skip: vi.fn().mockReturnThis(),
    take: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    addSelect: vi.fn().mockReturnThis(),
    withDeleted: vi.fn().mockReturnThis(),
    getManyAndCount: vi.fn().mockResolvedValue([results, count]),
    getOne: vi.fn().mockResolvedValue(results[0] || null),
    getMany: vi.fn().mockResolvedValue(results),
  };
  return qb;
};

export const createMockManager = () => ({
  findOne: vi.fn(),
  save: vi.fn(),
  delete: vi.fn(),
  update: vi.fn(),
  create: vi.fn(),
  transaction: vi.fn(async (callback) => {
    const txManager = createMockManager();
    return await callback(txManager);
  }),
});

export const createMockRepository = <T>() => {
  const repository = {
    find: vi.fn(),
    findOne: vi.fn(),
    findOneBy: vi.fn(),
    findAndCount: vi.fn(),
    save: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
    softDelete: vi.fn(),
    softRemove: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
    recover: vi.fn(),
    createQueryBuilder: vi.fn(() => createMockQueryBuilder<T>()),
    manager: createMockManager(),
  };
  return repository;
};

export type MockRepository<T> = ReturnType<typeof createMockRepository<T>>;
