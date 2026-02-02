import { Order, OrderStatus } from "@/modules/order/entities/Order";
import { OrderItem } from "@/modules/order/entities/OrderItem";
import { faker } from "@faker-js/faker";
import { User } from "@/modules/user/entities/User";
import { Product } from "@/modules/product/entities/Product";

export const createMockOrder = (overrides?: Partial<Order>): Order => {
    return {
        id: faker.number.int({ min: 1, max: 1000 }),
        orderId: faker.string.uuid(),
        total: parseFloat(faker.commerce.price({ min: 10, max: 500 })),
        status: OrderStatus.PAID,
        paymentId: `pi_${faker.string.alphanumeric(24)}`,
        failureReason: "",
        createdAt: new Date(),
        items: [],
        user: {} as User,
        generateOrderId: () => { },
        ...overrides,
    };
};

export const createMockOrderItem = (
    overrides?: Partial<OrderItem>
): OrderItem => {
    return {
        id: faker.number.int({ min: 1, max: 1000 }),
        quantity: faker.number.int({ min: 1, max: 5 }),
        priceAtPurchase: parseFloat(faker.commerce.price({ min: 10, max: 200 })),
        order: {} as Order,
        product: {} as Product,
        ...overrides,
    };
};
