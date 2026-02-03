import { UserService, UserController } from "@modules/user";
import { ProductController, ProductService } from "@modules/product";
import { CategoryService, CategoryController } from "@modules/category";
import { CartService, CartController } from "@modules/cart";
import { OrderService, OrderController } from "@modules/order";
import { DataSource } from "typeorm";
import { User } from "@modules/user/entities/User";
import { Product } from "@modules/product/entities/Product";
import { Category } from "@modules/category/entities/Category";
import { Cart } from "@modules/cart/entities/Cart";
import { CartItem } from "@modules/cart/entities/CartItem";
import { Order } from "@modules/order/entities/Order";
import { IEmailService } from "@shared/interfaces/IEmailService";
import { ResendEmailService } from "@shared/services/email/ResendEmailService";
import { StripePaymentGateway } from "@shared/services/payment/StripePaymentGateway";
import { env } from "@config/environment";

export interface Container {
  userController: UserController;
  productController: ProductController;
  categoryController: CategoryController;
  cartController: CartController;
  orderController: OrderController;
}
export function createContainer(dataSource: DataSource): Container {
  const userRepository = dataSource.getRepository(User);
  const userService = new UserService(userRepository);
  const userController = new UserController(userService);

  const categoryRepository = dataSource.getRepository(Category);
  const categoryService = new CategoryService(categoryRepository);
  const categoryController = new CategoryController(categoryService);

  const productRepository = dataSource.getRepository(Product);
  const productService = new ProductService(productRepository, categoryRepository);
  const productController = new ProductController(productService);

  const cartRepository = dataSource.getRepository(Cart);
  const cartItemRepository = dataSource.getRepository(CartItem);
  const cartService = new CartService(
    cartRepository,
    cartItemRepository,
    productRepository,
  );
  const cartController = new CartController(cartService);

  const orderRepository = dataSource.getRepository(Order);
  const paymentGateway = new StripePaymentGateway(env.STRIPE_SECRET_KEY);
  const emailService: IEmailService = new ResendEmailService(
    env.RESEND_API_KEY,
  );
  const orderService = new OrderService(
    orderRepository,
    userRepository,
    cartRepository,
    cartItemRepository,
    productRepository,
    paymentGateway,
    emailService,
  );
  const orderController = new OrderController(orderService);

  return {
    userController,
    productController,
    categoryController,
    cartController,
    orderController,
  };
}
