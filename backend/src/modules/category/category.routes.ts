import { Router } from "express";
import { validate } from "@/shared/middleware/validate";
import { CategoryController } from "./category.controller";
import {
  createCategorySchema,
  updateCategorySchema,
  categoryQuerySchema,
} from "./category.validation";
import { requireAuth } from "@/shared/middleware/requireAuth";
import { UserRole } from "@/modules/user/entities/User";

export function createCategoryRoutes(controller: CategoryController): Router {
  const router = Router();
  // public routes
  router.get("/", validate(categoryQuerySchema, "query"), controller.getAllCategories);
  router.get("/:categoryId", controller.getCategoryById);

  // admin routes
  router.post(
    "/",
    requireAuth(UserRole.STAFF),
    validate(createCategorySchema),
    controller.createCategory,
  );
  router.put(
    "/:categoryId",
    requireAuth(UserRole.STAFF),
    validate(updateCategorySchema),
    controller.updateCategory,
  );
  router.delete(
    "/:categoryId",
    requireAuth(UserRole.STAFF),
    controller.deleteCategory,
  );
  return router;
}
