import { UserService } from "./modules/user/user.service";
import { ProductController } from "./modules/product/product.controller";
import { UserController } from "./modules/user/user.controller";
import { DataSource } from "typeorm";
import { User } from "./modules/user/entities/User";
import { Product } from "./modules/product/entities/Product";
import { ProductService } from "./modules/product/product.service";
import { Category } from "./modules/category/entities/Category";
import { CategoryService } from "./modules/category/category.service";
import { CategoryController } from "./modules/category/category.controller";
import { Cart } from "./modules/cart/entities/Cart";
import { CartService } from "./modules/cart/cart.service";
import { CartController } from "./modules/cart/cart.controller";
import { CartItem } from "./modules/cart/entities/CartItem";

export interface Container {
  userController: UserController;
  productController: ProductController;
  categoryController: CategoryController;
  cartController: CartController;
}
export function createContainer(dataSource: DataSource): Container {
  const userRepository = dataSource.getRepository(User);
  const userService = new UserService(userRepository);
  const userController = new UserController(userService);

  const productRepository = dataSource.getRepository(Product);
  const productService = new ProductService(productRepository);
  const productController = new ProductController(productService);

  const categoryRepository = dataSource.getRepository(Category);
  const categoryService = new CategoryService(categoryRepository);
  const categoryController = new CategoryController(categoryService);

  const cartRepository = dataSource.getRepository(Cart);
  const cartItemRepository = dataSource.getRepository(CartItem);
  const cartService = new CartService(
    cartRepository,
    cartItemRepository,
    productRepository,
    userRepository,
  );
  const cartController = new CartController(cartService);

  return {
    userController,
    productController,
    categoryController,
    cartController,
  };
}
