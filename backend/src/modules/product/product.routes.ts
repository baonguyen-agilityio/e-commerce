import { Router } from "express";
import { ProductController } from "./product.controller";
import { validate } from "@/shared/middleware/validate";
import { createProductSchema, updateProductSchema, productQuerySchema } from "./product.validation";
import { requireAuth } from "@/shared/middleware/requireAuth";
import { UserRole } from "@/modules/user/entities/User";

export function createProductRoutes(controller: ProductController): Router {
  const router = Router();
  // public routes
  router.get("/", validate(productQuerySchema, "query"), controller.getAllProducts);
  router.get("/:productId", controller.getProductByProductId);

  // admin routes
  router.post(
    "/",
    requireAuth(UserRole.STAFF),
    validate(createProductSchema),
    controller.createProduct,
  );
  router.put(
    "/:productId",
    requireAuth(UserRole.STAFF),
    validate(updateProductSchema),
    controller.updateProduct,
  );
  router.delete(
    "/:productId",
    requireAuth(UserRole.STAFF),
    controller.deleteProduct,
  );
  return router;
}
