import { Category } from "@/modules/category/entities/Category";
import { faker } from "@faker-js/faker";

export const createMockCategory = (overrides?: Partial<Category>): Category => {
    return {
        id: faker.number.int({ min: 1, max: 1000 }),
        categoryId: faker.string.uuid(),
        name: faker.commerce.department(),
        description: faker.commerce.productDescription(),
        createdAt: new Date(),
        deletedAt: null,
        products: [],
        generateCategoryId: () => { },
        ...overrides,
    };
};
