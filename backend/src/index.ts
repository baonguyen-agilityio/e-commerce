import "reflect-metadata";
import "dotenv/config";
import express from "express";
import cors from "cors";
import { AppDataSource } from "./config/database";
import { clerkMiddleware } from "@clerk/express";
import { createContainer } from "./container";
import { createUserRoutes } from "./modules/user";
import { createProductRoutes } from "./modules/product";
import { createCategoryRoutes } from "./modules/category";
import { createCartRoutes } from "./modules/cart";
import { createOrderRoutes } from "./modules/order";
import { errorHandler } from "./shared/middleware/errorHandler";
import helmet from "helmet";
import { apiLimiter, checkoutLimiter } from "./shared/middleware/rateLimiter";
import { env } from "./config/environment";

const app = express();
const PORT = env.PORT;

app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (env.ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(clerkMiddleware());

AppDataSource.initialize()
  .then(() => {
    console.log("Database connected successfully");

    const container = createContainer(AppDataSource);

    app.use("/api", apiLimiter);
    app.use("/api/users", createUserRoutes(container.userController));
    app.use("/api/products", createProductRoutes(container.productController));
    app.use(
      "/api/categories",
      createCategoryRoutes(container.categoryController),
    );
    app.use("/api/cart", createCartRoutes(container.cartController));
    app.use(
      "/api/orders",
      checkoutLimiter,
      createOrderRoutes(container.orderController),
    );

    app.use(errorHandler);

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error: Error) => {
    console.error("Database connection failed:", error);
    process.exit(1);
  });

export default app;
