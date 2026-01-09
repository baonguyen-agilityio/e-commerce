import { Router } from "express";
import { ProductController } from "./product.controller";
import { validate } from "../../shared/middleware/validate";
import { createProductSchema, updateProductSchema } from "./product.validation";
import { requireAuthenticated } from "../../shared/middleware/requireAuth";
import { adminOnly } from "../../shared/middleware/adminOnly";

export function createProductRoutes(controller: ProductController): Router {
  const router = Router();
  // public routes
  router.get("/", controller.getAllProducts);
  router.get("/:id", controller.getProductById);

  // admin routes
  router.post(
    "/",
    requireAuthenticated,
    adminOnly,
    validate(createProductSchema),
    controller.createProduct,
  );
  router.put(
    "/:id",
    requireAuthenticated,
    adminOnly,
    validate(updateProductSchema),
    controller.updateProduct,
  );
  router.delete(
    "/:id",
    requireAuthenticated,
    adminOnly,
    controller.deleteProduct,
  );
  return router;
}
