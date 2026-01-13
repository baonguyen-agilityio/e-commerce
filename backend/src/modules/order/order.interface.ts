import { Order } from "./entities/Order";

export interface CheckoutResult {
  success: boolean;
  order?: Order;
  error?: string;
}

export interface IOrderService {
  checkoutOrder(clerkId: string): Promise<CheckoutResult>;
  getOrders(clerkId: string, role: string): Promise<Order[]>;
  getOrderById(orderId: number, clerkId: string, role: string): Promise<Order | null>;
}