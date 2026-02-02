import { Cart } from "@/modules/cart/entities/Cart";
import { CartItem } from "@/modules/cart/entities/CartItem";
import { Product } from "@/modules/product/entities/Product";
import { faker } from "@faker-js/faker";
import { User } from "@/modules/user/entities/User";

export const createMockCart = (overrides?: Partial<Cart>): Cart => {
    return {
        id: faker.number.int({ min: 1, max: 1000 }),
        clerkId: `user_${faker.string.alphanumeric(16)}`,
        items: [],
        updatedAt: new Date(),
        user: {} as User,
        ...overrides,
    };
};

export const createMockCartItem = (
    overrides?: Partial<CartItem>
): CartItem => {
    return {
        id: faker.number.int({ min: 1, max: 1000 }),
        cartItemId: faker.string.uuid(),
        quantity: faker.number.int({ min: 1, max: 5 }),
        cart: {} as Cart,
        product: {} as Product,
        generateCartItemId: () => { },
        ...overrides,
    };
};
