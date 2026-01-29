import { Order, OrderStatus } from "@/modules/order/entities/Order";
import { OrderItem } from "@/modules/order/entities/OrderItem";
import { faker } from "@faker-js/faker";

export const createMockOrder = (overrides?: Partial<Order>): Order => {
    return {
        id: faker.number.int({ min: 1, max: 1000 }),
        publicId: faker.string.uuid(),
        userId: faker.number.int({ min: 1, max: 100 }),
        total: parseFloat(faker.commerce.price({ min: 10, max: 500 })),
        status: OrderStatus.PAID,
        paymentId: `pi_${faker.string.alphanumeric(24)}`,
        failureReason: "",
        createdAt: new Date(),
        items: [],
        user: {} as any,
        generatePublicId: () => { },
        ...overrides,
    };
};

export const createMockOrderItem = (
    overrides?: Partial<OrderItem>
): OrderItem => {
    return {
        id: faker.number.int({ min: 1, max: 1000 }),
        orderId: faker.number.int({ min: 1, max: 100 }),
        productId: faker.number.int({ min: 1, max: 100 }),
        quantity: faker.number.int({ min: 1, max: 5 }),
        priceAtPurchase: parseFloat(faker.commerce.price({ min: 10, max: 200 })),
        order: {} as any,
        product: {} as any,
        ...overrides,
    };
};
