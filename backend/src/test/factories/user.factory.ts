import { User, UserRole } from "@/modules/user/entities/User";
import { faker } from "@faker-js/faker";

export const createMockUser = (overrides?: Partial<User>): User => {
    return {
        id: faker.number.int({ min: 1, max: 1000 }),
        clerkId: `user_${faker.string.alphanumeric(16)}`,
        email: faker.internet.email(),
        name: faker.person.fullName(),
        role: UserRole.CUSTOMER,
        publicId: faker.string.uuid(),
        isBanned: false,
        isLocked: false,
        createdAt: new Date(),
        deletedAt: null,
        cart: {} as any,
        orders: [],
        generatePublicId: () => { },
        banInClerk: async () => { },
        unbanInClerk: async () => { },
        ...overrides,
    };
};
