import { Repository } from "typeorm";
import { Order } from "./entities/Order";
import { CheckoutResult, IOrderService } from "./order.interface";
import { User } from "../user/entities/User";
import { AppError } from "../../shared/middleware/errorHandler";
import { Cart } from "../cart/entities/Cart";
import Stripe from "stripe";
import { CartItem } from "../cart/entities/CartItem";
import { OrderItem } from "./entities/OrderItem";
import { Product } from "../product/entities/Product";
import { IPaymentGateway } from "../../shared/interfaces/IPaymentGateway";

export class OrderService implements IOrderService {
  private stripe: Stripe;
  constructor(
    private readonly orderRepository: Repository<Order>,
    private readonly orderItemRepository: Repository<OrderItem>,
    private readonly userRepository: Repository<User>,
    private readonly cartRepository: Repository<Cart>,
    private readonly cartItemRepository: Repository<CartItem>,
    private readonly productRepository: Repository<Product>,
    private readonly paymentGateway: IPaymentGateway,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
  }

  async checkoutOrder(clerkId: string): Promise<CheckoutResult> {
    const user = await this.userRepository.findOneBy({ clerkId });

    if (!user) {
      throw new AppError(404, "User not found");
    }

    const cart = await this.cartRepository.findOne({
      where: { user: { id: user.id } },
      relations: ["items", "items.product"],
    });

    if (!cart || !cart.items || cart.items.length === 0) {
      throw new AppError(400, "Cart is empty");
    }

    let total = 0;
    for (const item of cart.items) {
      total += Number(item.product.price) * item.quantity;
    }
    total = Math.round(total * 100) / 100;

    const paymentIntent = await this.paymentGateway.processPayment({
      amount: total,
      currency: "usd",
      description: `Order payment for user ${user.email}`,
    });

    if (!paymentIntent.success) {
      throw new AppError(400, paymentIntent.error || "Payment failed");
    }

    const order = this.orderRepository.create({
      userId: user.id,
      total: total / 100,
      status: "PAID",
      paymentId: paymentIntent.paymentId,
    });
    await this.orderRepository.save(order);

    for (const cartItem of cart.items) {
      const orderItem = this.orderItemRepository.create({
        orderId: order.id,
        productId: cartItem.product.id,
        quantity: cartItem.quantity,
        priceAtPurchase: cartItem.product.price,
      });
      await this.orderItemRepository.save(orderItem);

      await this.productRepository.update(cartItem.productId, {
        stock: () => `stock - ${cartItem.quantity}`,
      });
    }

    await this.cartItemRepository.delete({ cartId: cart.id });

    const fullOrder = await this.orderRepository.findOne({
      where: { id: order.id },
      relations: ["items", "items.product"],
    });
    return { order: fullOrder!, success: true };
  }

  async getOrders(clerkId: string, role: string): Promise<Order[]> {
    const user = await this.userRepository.findOneBy({ clerkId });

    if (role === "admin") {
      return this.orderRepository.find({
        relations: ["items", "items.product", "user"],
        order: { createdAt: "DESC" },
      });
    }

    if (!user) {
      throw new AppError(404, "User not found");
    }

    const orders = await this.orderRepository.find({
      where: { userId: user.id },
      relations: ["items", "items.product"],
      order: { createdAt: "DESC" },
    });

    return orders;
  }

  async getOrderById(
    orderId: number,
    clerkId: string,
    role: string,
  ): Promise<Order | null> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ["items", "items.product"],
    });

    if (!order) {
      throw new AppError(404, "Order not found");
    }

    if (role === "admin") {
      return order;
    }

    const user = await this.userRepository.findOneBy({ clerkId });
    if (!user || order.userId !== user.id) {
      throw new AppError(403, "Not authorized to view this order");
    }

    return order;
  }
}
