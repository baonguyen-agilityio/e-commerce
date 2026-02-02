import { Category } from "@/modules/category/entities/Category";
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
        productId: faker.string.uuid(),
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        imageUrl: faker.image.url(),
        category: {} as Category,
        cartItems: [],
        orderItems: [],
        generateProductId: () => { },
        ...overrides,
    };
};
