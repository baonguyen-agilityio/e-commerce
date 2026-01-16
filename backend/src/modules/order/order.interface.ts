import { UserRole } from "../user/entities/User";
import { Order } from "./entities/Order";

export interface CheckoutResult {
  success: boolean;
  order?: Order;
  error?: string;
}

export interface IOrderService {
  checkoutOrder(clerkId: string): Promise<CheckoutResult>;
  getOrders(): Promise<Order[]>
  getOrdersByUser(clerkId: string): Promise<Order[]>;
  getOrderById(orderId: number, clerkId: string, role: UserRole): Promise<Order | null>;
}