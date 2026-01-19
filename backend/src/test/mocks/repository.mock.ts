import { vi } from "vitest";

export const createMockRepository = <T>() => ({
  find: vi.fn(),
  findOne: vi.fn(),
  findOneBy: vi.fn(),
  save: vi.fn(),
  create: vi.fn(),
  delete: vi.fn(),
  update: vi.fn(),
  count: vi.fn(),
  createQueryBuilder: vi.fn(() => ({
    leftJoinAndSelect: vi.fn().mockReturnThis(),
    andWhere: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    skip: vi.fn().mockReturnThis(),
    take: vi.fn().mockReturnThis(),
    getManyAndCount: vi.fn(),
  })),
});

export type MockRepository<T> = ReturnType<typeof createMockRepository<T>>;
