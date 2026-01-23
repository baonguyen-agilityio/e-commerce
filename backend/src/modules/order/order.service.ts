import { Repository } from "typeorm";
import { Order } from "./entities/Order";
import { CheckoutResult, IOrderService } from "./order.interface";
import { hasPermission, User, UserRole } from "../user/entities/User";
import { Cart } from "../cart/entities/Cart";
import { CartItem } from "../cart/entities/CartItem";
import { OrderItem } from "./entities/OrderItem";
import { Product } from "../product/entities/Product";
import { IPaymentGateway } from "../../shared/interfaces/IPaymentGateway";
import { BadRequestError, ForbiddenError, NotFoundError } from "../../shared/errors";
import { ErrorMessages } from "../../shared/errors/messages";
import { IEmailService } from "../../shared/interfaces/IEmailService";

export class OrderService implements IOrderService {
  constructor(
    private readonly orderRepository: Repository<Order>,
    private readonly userRepository: Repository<User>,
    private readonly cartRepository: Repository<Cart>,
    private readonly paymentGateway: IPaymentGateway,
    private readonly emailService: IEmailService
  ) { }

  private async findUserOrThrow(clerkId: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ clerkId });
    if (!user) {
      throw new NotFoundError(ErrorMessages.USER_NOT_FOUND);
    }
    return user;
  }

  async checkoutOrder(clerkId: string): Promise<CheckoutResult> {
    const user = await this.findUserOrThrow(clerkId);
    const cart = await this.cartRepository.findOne({
      where: { user: { id: user.id } },
      relations: ["items", "items.product"],
    });

    if (!cart || !cart.items || cart.items.length === 0) {
      throw new BadRequestError(ErrorMessages.CART_EMPTY);
    }

    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        throw new BadRequestError(
          `Insufficient stock for ${item.product.name}. Available: ${item.product.stock}, Requested: ${item.quantity}`
        );
      }
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
      throw new BadRequestError(paymentIntent.error || ErrorMessages.PAYMENT_FAILED);
    }

    const fullOrder = await this.orderRepository.manager.transaction(async (manager) => {
      const order = manager.create(Order, {
        userId: user.id,
        total,
        status: "PAID",
        paymentId: paymentIntent.paymentId,
      });
      await manager.save(order);

      const orderItems: OrderItem[] = [];
      for (const cartItem of cart.items) {
        const orderItem = manager.create(OrderItem, {
          orderId: order.id,
          productId: cartItem.product.id,
          quantity: cartItem.quantity,
          priceAtPurchase: cartItem.product.price,
        });
        orderItems.push(orderItem);
      }
      await manager.save(orderItems);

      for (const cartItem of cart.items) {
        const result = await manager
          .createQueryBuilder()
          .update(Product)
          .set({ stock: () => `stock - ${cartItem.quantity}` })
          .where("id = :id AND stock >= :quantity", {
            id: cartItem.productId,
            quantity: cartItem.quantity,
          })
          .execute();

        if (result.affected === 0) {
          throw new BadRequestError(
            `Insufficient stock for product ${cartItem.product.name}. Please try again.`
          );
        }
      }

      await manager.delete(CartItem, { cartId: cart.id });

      const completeOrder = await manager.findOne(Order, {
        where: { id: order.id },
        relations: ["items", "items.product"],
      });

      return completeOrder!;
    });

    this.emailService
      .sendOrderConfirmation({
        order: fullOrder,
        customer: user,
      })
      .catch((err) => {
        console.error("Failed to send order confirmation email:", err);
      });

    return { order: fullOrder, success: true };
  }

  async getOrdersByUser(clerkId: string): Promise<Order[]> {
    const user = await this.findUserOrThrow(clerkId);
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
    role: UserRole,
  ): Promise<Order | null> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ["items", "items.product"],
    });

    if (!order) {
      throw new NotFoundError(ErrorMessages.ORDER_NOT_FOUND);
    }

    if (hasPermission(role, UserRole.ADMIN)) {
      return order;
    }

    const user = await this.findUserOrThrow(clerkId);
    if (order.userId !== user.id) {
      throw new ForbiddenError(ErrorMessages.NOT_AUTHORIZED_TO_VIEW_ORDER);
    }

    return order;
  }

  async getOrders(): Promise<Order[]> {
    return this.orderRepository.find({
      relations: ["items", "items.product", "user"],
      order: { createdAt: "DESC" },
    });
  }
}
