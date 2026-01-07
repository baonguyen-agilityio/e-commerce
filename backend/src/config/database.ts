import { DataSource } from "typeorm";
import { User } from "../modules/user/entities/User";
import { Product } from "../modules/product/entities/Product";
import { Category } from "../modules/category/entities/Category";
import { Cart } from "../modules/cart/entities/Cart";
import { CartItem } from "../modules/cart/entities/CartItem";
import { Order } from "../modules/order/entities/Order";
import { OrderItem } from "../modules/order/entities/OrderItem";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "e_commerce",
  synchronize: process.env.NODE_ENV !== "production",
  logging: process.env.NODE_ENV === "development",
  entities: [User, Product, Category, Cart, CartItem, Order, OrderItem],
});
