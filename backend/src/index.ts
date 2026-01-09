import "reflect-metadata";
import "dotenv/config";
import express from "express";
import cors from "cors";
import { AppDataSource } from "./config/database";
import { clerkMiddleware } from "@clerk/express";
import { createContainer } from "./container";
import { createUserRoutes } from "./modules/user/user.routes";
import { createProductRoutes } from "./modules/product/product.routes";
import { errorHandler } from "./shared/middleware/errorHandler";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

AppDataSource.initialize()
  .then(() => {
    console.log("Database connected successfully");

    const container = createContainer(AppDataSource);

    app.use("/api/users", createUserRoutes(container.userController));
    app.use("/api/products", createProductRoutes(container.productController));

    app.use(errorHandler)

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error: Error) => {
    console.error("Database connection failed:", error);
    process.exit(1);
  });

export default app;
