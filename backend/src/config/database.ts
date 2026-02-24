import { DataSource } from "typeorm";
import { User } from "../modules/user/entities/User";
import { Product } from "../modules/product/entities/Product";
import { Category } from "../modules/category/entities/Category";
import { Cart } from "../modules/cart/entities/Cart";
import { CartItem } from "../modules/cart/entities/CartItem";
import { Order } from "../modules/order/entities/Order";
import { OrderItem } from "../modules/order/entities/OrderItem";
import { env } from "./environment";

const shouldUseDatabaseUrl = Boolean(env.DATABASE_URL);
const shouldUseSsl = env.DB_SSL || shouldUseDatabaseUrl;

const dbConnectionConfig = shouldUseDatabaseUrl
  ? {
      url: env.DATABASE_URL,
      ...(shouldUseSsl ? { ssl: { rejectUnauthorized: false } } : {}),
    }
  : {
      host: env.DB_HOST!,
      port: env.DB_PORT!,
      username: env.DB_USERNAME!,
      password: env.DB_PASSWORD!,
      database: env.DB_NAME!,
      ...(shouldUseSsl ? { ssl: { rejectUnauthorized: false } } : {}),
    };

export const AppDataSource = new DataSource({
  type: "postgres",
  ...dbConnectionConfig,
  synchronize: false,
  logging: false,
  entities: [User, Product, Category, Cart, CartItem, Order, OrderItem],
  migrations: ["src/migrations/*.ts"],
});
