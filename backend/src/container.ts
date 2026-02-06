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
import { UserRepository } from "@modules/user/user.repository";
import { CategoryRepository } from "@modules/category/category.repository";
import { ProductRepository } from "@modules/product/product.repository";
import { CartItemRepository, CartRepository } from "@modules/cart/cart.repository";
import { OrderRepository } from "@modules/order/order.repository";

export interface Container {
  userController: UserController;
  productController: ProductController;
  categoryController: CategoryController;
  cartController: CartController;
  orderController: OrderController;
}
export function createContainer(dataSource: DataSource): Container {
  const typeormUserRepository = dataSource.getRepository(User);
  const userRepository = new UserRepository(typeormUserRepository);
  const userService = new UserService(userRepository);
  const userController = new UserController(userService);

  const typeormCategoryRepository = dataSource.getRepository(Category);
  const categoryRepository = new CategoryRepository(typeormCategoryRepository);
  const categoryService = new CategoryService(categoryRepository);
  const categoryController = new CategoryController(categoryService);

  const typeormProductRepository = dataSource.getRepository(Product);
  const productRepository = new ProductRepository(typeormProductRepository);
  const productService = new ProductService(
    productRepository,
    categoryRepository,
  );
  const productController = new ProductController(productService);

  const typeormCartRepository = dataSource.getRepository(Cart);
  const typeormCartItemRepository = dataSource.getRepository(CartItem);
  const cartRepository = new CartRepository(typeormCartRepository);
  const cartItemRepository = new CartItemRepository(typeormCartItemRepository);

  const cartService = new CartService(
    cartRepository,
    cartItemRepository,
    productRepository,
  );
  const cartController = new CartController(cartService);

  const typeormOrderRepository = dataSource.getRepository(Order);
  const orderRepository = new OrderRepository(typeormOrderRepository);
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
    dataSource,
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
