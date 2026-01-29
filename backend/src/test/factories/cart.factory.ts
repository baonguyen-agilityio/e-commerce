import { Cart } from "@/modules/cart/entities/Cart";
import { CartItem } from "@/modules/cart/entities/CartItem";
import { faker } from "@faker-js/faker";

export const createMockCart = (overrides?: Partial<Cart>): Cart => {
    return {
        id: faker.number.int({ min: 1, max: 1000 }),
        clerkId: `user_${faker.string.alphanumeric(16)}`,
        items: [],
        updatedAt: new Date(),
        user: {} as any,
        ...overrides,
    };
};

export const createMockCartItem = (
    overrides?: Partial<CartItem>
): CartItem => {
    return {
        id: faker.number.int({ min: 1, max: 1000 }),
        publicId: faker.string.uuid(),
        cartId: faker.number.int({ min: 1, max: 100 }),
        productId: faker.number.int({ min: 1, max: 100 }),
        quantity: faker.number.int({ min: 1, max: 5 }),
        cart: {} as any,
        product: {} as any,
        generatePublicId: () => { },
        ...overrides,
    };
};
