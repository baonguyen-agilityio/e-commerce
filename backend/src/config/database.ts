import { DataSource } from "typeorm";
import { User } from "../modules/user/entities/User";
import { Product } from "../modules/product/entities/Product";
import { Category } from "../modules/category/entities/Category";
import { Cart } from "../modules/cart/entities/Cart";
import { CartItem } from "../modules/cart/entities/CartItem";
import { Order } from "../modules/order/entities/Order";
import { OrderItem } from "../modules/order/entities/OrderItem";
import { env } from "./environment";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USERNAME,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  synchronize: env.NODE_ENV !== "production",
  logging: env.NODE_ENV === "development",
  entities: [User, Product, Category, Cart, CartItem, Order, OrderItem],
  migrations: ["src/migrations/*.ts"],
});
