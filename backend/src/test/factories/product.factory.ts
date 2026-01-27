import { Product } from "@/modules/product/entities/Product";
import { faker } from "@faker-js/faker";

export const createMockProduct = (overrides?: Partial<Product>): Product => {
    return {
        id: faker.number.int(),
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: parseFloat(faker.commerce.price()),
        stock: faker.number.int({ min: 0, max: 100 }),
        isActive: true,
        publicId: faker.string.uuid(),
        categoryId: faker.number.int({ min: 1, max: 10 }),
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        imageUrl: faker.image.url(),
        category: {} as any,
        cartItems: [],
        orderItems: [],
        generatePublicId: () => { },
        ...overrides,
    };
};
