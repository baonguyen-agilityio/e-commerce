import { Router } from "express";
import { ProductController } from "./product.controller";
import { validate } from "../../shared/middleware/validate";
import { createProductSchema, updateProductSchema } from "./product.validation";
import { requireAuth } from "../../shared/middleware/requireAuth";
import { UserRole } from "../user/entities/User";

export function createProductRoutes(controller: ProductController): Router {
  const router = Router();
  // public routes
  router.get("/", controller.getAllProducts);
  router.get("/:id", controller.getProductById);

  // admin routes
  router.post(
    "/",
    requireAuth(UserRole.ADMIN),
    validate(createProductSchema),
    controller.createProduct,
  );
  router.put(
    "/:id",
    requireAuth(UserRole.ADMIN),
    validate(updateProductSchema),
    controller.updateProduct,
  );
  router.delete(
    "/:id",
    requireAuth(UserRole.ADMIN),
    controller.deleteProduct,
  );
  return router;
}
