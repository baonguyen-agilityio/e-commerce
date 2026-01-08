import { UserService } from "./modules/user/user.service";
import { ProductController } from "./modules/product/product.controller";
import { UserController } from "./modules/user/user.controller";
import { DataSource } from "typeorm";
import { User } from "./modules/user/entities/User";
import { Product } from "./modules/product/entities/Product";
import { ProductService } from "./modules/product/product.service";

export interface Container {
  userController: UserController;
  productController: ProductController;
}
export function createContainer(dataSource: DataSource): Container {
  const userRepository = dataSource.getRepository(User);
  const userService = new UserService(userRepository);
  const userController = new UserController(userService);

  const productRepository = dataSource.getRepository(Product);
    const productService = new ProductService(productRepository);
  const productController = new ProductController(productService);

  return {
    userController,
    productController,
  };
}
