import "reflect-metadata";
import "dotenv/config";
import express from "express";
import cors from "cors";
import { AppDataSource } from "@config/database";
import { clerkMiddleware } from "@clerk/express";
import { createContainer } from "@/container";
import { createUserRoutes } from "@modules/user";
import { createProductRoutes } from "@modules/product";
import { createCategoryRoutes } from "@modules/category";
import { createCartRoutes } from "@modules/cart";
import { createOrderRoutes } from "@modules/order";
import { errorHandler } from "@shared/middleware/errorHandler";
import helmet from "helmet";
import { apiLimiter } from "@shared/middleware/rateLimiter";
import { env } from "@config/environment";
import { Server } from "http";

const app = express();
const PORT = env.PORT;

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (env.ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(clerkMiddleware());

let server: Server;

AppDataSource.initialize()
  .then(() => {
    console.log("Database connected successfully");

    const container = createContainer(AppDataSource);

    const API_PREFIX = `/api/${env.API_VERSION}`;

    app.use("/api", apiLimiter);
    app.use(`${API_PREFIX}/users`, createUserRoutes(container.userController));
    app.use(`${API_PREFIX}/products`, createProductRoutes(container.productController));
    app.use(
      `${API_PREFIX}/categories`,
      createCategoryRoutes(container.categoryController),
    );
    app.use(`${API_PREFIX}/cart`, createCartRoutes(container.cartController));
    app.use(`${API_PREFIX}/orders`, createOrderRoutes(container.orderController));

    app.use(errorHandler);

    server = app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error: Error) => {
    console.error("Database connection failed:", error);
    process.exit(1);
  });

const gracefulShutdown = async (signal: string) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  if (server) {
    server.close(() => {
      console.log("HTTP server closed.");
    });
  }

  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log("Database connection closed.");
    }
  } catch (error) {
    console.error("Error during database shutdown:", error);
  }

  setTimeout(() => {
    process.exit(signal === "SIGINT" || signal === "SIGTERM" ? 0 : 1);
  }, 1000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  gracefulShutdown("unhandledRejection");
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  gracefulShutdown("uncaughtException");
});

export default app;
