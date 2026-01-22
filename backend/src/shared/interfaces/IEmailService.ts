import { Order } from "../../modules/order/entities/Order";
import { User } from "../../modules/user/entities/User";

export interface OrderEmailData {
    order: Order;
    customer: User;
}

export interface IEmailService {
    sendOrderConfirmation(data: OrderEmailData): Promise<void>;
}
