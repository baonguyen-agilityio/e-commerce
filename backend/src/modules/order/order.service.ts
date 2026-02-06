import { Brackets, DataSource } from "typeorm";
import { Order, OrderStatus } from "./entities/Order";
import { CheckoutResult, IOrderService, OrderQueryParams } from "./order.interface";
import { PaginatedResult } from "@/shared/interfaces/pagination";
import { hasPermission, User, UserRole } from "@modules/user/entities/User";
import { CartItem } from "@modules/cart/entities/CartItem";
import { OrderItem } from "./entities/OrderItem";
import { Product } from "@modules/product/entities/Product";
import { IPaymentGateway } from "@shared/interfaces/IPaymentGateway";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "@shared/errors";
import { ErrorMessages } from "@shared/errors/messages";
import { IEmailService } from "@shared/interfaces/IEmailService";
import { loggers } from "@shared/utils/logger";
import { IOrderRepository } from "./order.repository";
import { IUserRepository } from "@modules/user/user.repository";
import { ICartItemRepository, ICartRepository } from "@modules/cart/cart.repository";
import { IProductRepository } from "@modules/product/product.repository";

export class OrderService implements IOrderService {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly userRepository: IUserRepository,
    private readonly cartRepository: ICartRepository,
    private readonly cartItemRepository: ICartItemRepository,
    private readonly productRepository: IProductRepository,
    private readonly paymentGateway: IPaymentGateway,
    private readonly emailService: IEmailService,
    private readonly dataSource: DataSource,
  ) { }

  private async findUserOrThrow(clerkId: string): Promise<User> {
    const user = await this.userRepository.findByClerkId(clerkId);
    if (!user) {
      throw new NotFoundError(ErrorMessages.USER_NOT_FOUND);
    }
    return user;
  }

  async checkoutOrder(
    clerkId: string,
    paymentMethodId: string,
  ): Promise<CheckoutResult> {
    const logContext = { context: 'OrderService.checkoutOrder', userId: clerkId };

    loggers.info('Starting checkout process', { ...logContext, paymentMethodId: '***REDACTED***' });

    const user = await this.findUserOrThrow(clerkId);
    const cart = await this.cartRepository.findByClerkIdWithItems(clerkId);

    if (!cart || !cart.items || cart.items.length === 0) {
      loggers.warn('Checkout attempted with empty cart', logContext);
      throw new BadRequestError(ErrorMessages.CART_EMPTY);
    }

    let total = 0;
    for (const item of cart.items) {
      total += Number(item.product.price) * item.quantity;
    }
    total = Math.round(total * 100) / 100;

    loggers.info('Cart validated for checkout', {
      ...logContext,
      itemCount: cart.items.length,
      total,
    });

    for (const item of cart.items) {
      const product = await this.productRepository.findByProductId(item.product.productId);

      if (!product || product.stock < item.quantity) {
        const available = product ? product.stock : 0;

        if (available <= 0) {
          loggers.warn('Product out of stock, removing from cart', {
            ...logContext,
            productId: item.product.productId,
            productName: item.product.name,
          });
          await this.cartItemRepository.delete(item.id);
          throw new BadRequestError(
            `Product ${item.product.name} is out of stock and has been removed from your cart.`,
          );
        } else {
          loggers.warn('Insufficient stock, updating cart', {
            ...logContext,
            productId: item.product.productId,
            productName: item.product.name,
            requested: item.quantity,
            available,
          });
          await this.cartItemRepository.update(item.id, {
            quantity: available,
          });
          throw new BadRequestError(
            `Only ${available} units of ${item.product.name} are available. Your cart has been updated.`,
          );
        }
      }
    }

    const orderPublicId = await this.dataSource.transaction(
      async (manager) => {
        loggers.debug('Starting order creation transaction', logContext);

        for (const item of cart.items) {
          const product = await manager.findOne(Product, {
            where: { productId: item.product.productId },
            lock: { mode: "pessimistic_write" },
          });

          if (!product || product.stock < item.quantity) {
            loggers.error('Stock changed during checkout transaction', null, {
              ...logContext,
              productId: item.product.productId,
              requestedQuantity: item.quantity,
              availableStock: product?.stock || 0,
            });
            throw new BadRequestError(
              "Stock changed during checkout. Please try again.",
            );
          }
        }

        const order = manager.create(Order, {
          user,
          total,
          status: OrderStatus.PENDING_PAYMENT,
        });
        await manager.save(order);

        const orderItems = cart.items.map((cartItem) =>
          manager.create(OrderItem, {
            order,
            product: cartItem.product,
            quantity: cartItem.quantity,
            priceAtPurchase: cartItem.product.price,
          }),
        );
        await manager.save(orderItems);

        for (const item of cart.items) {
          await manager.update(Product, item.product.id, {
            stock: () => `stock - ${item.quantity}`,
          });
        }

        loggers.info('Order created successfully', {
          ...logContext,
          orderId: order.orderId,
          total,
          itemCount: cart.items.length,
        });

        return order.orderId;
      },
    );

    loggers.info('Processing payment', {
      ...logContext,
      orderId: orderPublicId,
      amount: total,
    });

    const paymentResult = await this.paymentGateway.processPayment({
      amount: total,
      currency: "usd",
      description: `Order #${orderPublicId} for ${user.email}`,
      paymentMethodId,
    });

    const finalOrder = await this.dataSource.transaction(
      async (manager) => {
        const order = await manager.findOne(Order, {
          where: { orderId: orderPublicId },
          relations: ["items", "items.product"],
        });

        if (!order)
          throw new Error("Critical error: Order not found after creation");

        if (paymentResult.success) {
          loggers.info('Payment successful', {
            ...logContext,
            orderId: orderPublicId,
            paymentId: paymentResult.paymentId,
            amount: total,
          });

          order.status = OrderStatus.PAID;
          order.paymentId = paymentResult.paymentId;
          await manager.save(order);
          await manager.delete(CartItem, { cart: { id: cart.id } });

          loggers.info('Cart cleared after successful payment', {
            ...logContext,
            orderId: orderPublicId,
          });

          return order;
        } else {
          loggers.error('Payment failed, rolling back inventory', null, {
            ...logContext,
            orderId: orderPublicId,
            error: paymentResult.error,
            amount: total,
          });

          order.status = OrderStatus.FAILED;
          order.failureReason = paymentResult.error || "Unknown payment error";
          await manager.save(order);

          for (const item of order.items) {
            await manager.update(Product, item.product.id, {
              stock: () => `stock + ${item.quantity}`,
            });
          }

          loggers.info('Inventory restored after payment failure', {
            ...logContext,
            orderId: orderPublicId,
          });

          return order;
        }
      },
    );

    if (finalOrder.status === OrderStatus.FAILED) {
      throw new BadRequestError(
        paymentResult.error || "Payment failed. Stock has been restored.",
      );
    }

    this.emailService
      .sendOrderConfirmation({ order: finalOrder, customer: user })
      .catch((err) => {
        loggers.error('Failed to send order confirmation email', err, {
          ...logContext,
          orderId: finalOrder.orderId,
          userEmail: user.email,
        });
      });

    loggers.info('Checkout completed successfully', {
      ...logContext,
      orderId: finalOrder.orderId,
      total: finalOrder.total,
    });

    return { order: finalOrder, success: true };
  }

  async getOrdersByUser(
    clerkId: string,
    params: OrderQueryParams = {},
  ): Promise<PaginatedResult<Order>> {
    const user = await this.findUserOrThrow(clerkId);
    return this.orderRepository.findByUser(user.id, params);
  }

  async getOrderById(
    orderId: string,
    clerkId: string,
    role: UserRole,
  ): Promise<Order | null> {
    const order = await this.orderRepository.findByOrderId(orderId);

    if (!order) {
      throw new NotFoundError(ErrorMessages.ORDER_NOT_FOUND);
    }

    if (hasPermission(role, UserRole.ADMIN)) {
      return order;
    }

    const user = await this.findUserOrThrow(clerkId);
    if (order.user.id !== user.id) {
      throw new ForbiddenError(ErrorMessages.NOT_AUTHORIZED_TO_VIEW_ORDER);
    }

    return order;
  }

  async getOrders(
    params: OrderQueryParams = {},
  ): Promise<PaginatedResult<Order>> {
    return this.orderRepository.findAll(params);
  }
}
