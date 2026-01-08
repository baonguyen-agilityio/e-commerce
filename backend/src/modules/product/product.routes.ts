import { Router } from "express";
import { ProductController } from "./product.controller";

export function createProductRoutes(controller: ProductController): Router {
  const router = Router();
  // public routes
  router.get("/", controller.getAllProducts);
  // router.get("/:id", controller.getProductById);

  // admin routes
  // router.post("/", controller.createProduct);
  // router.put("/:id", controller.updateProduct);
  // router.delete("/:id", controller.deleteProduct);
  return router;
}
