import { PaginatedResult } from "../../shared/interfaces/pagination";
import { UserRole } from "../user/entities/User";
import { Order } from "./entities/Order";

export interface CheckoutResult {
  success: boolean;
  order?: Order;
  error?: string;
}

export interface OrderQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface IOrderService {
  checkoutOrder(
    clerkId: string,
    paymentMethodId?: string,
  ): Promise<CheckoutResult>;
  getOrders(params?: OrderQueryParams): Promise<PaginatedResult<Order>>;
  getOrdersByUser(clerkId: string): Promise<Order[]>;
  getOrderById(
    orderId: number,
    clerkId: string,
    role: UserRole,
  ): Promise<Order | null>;
}
