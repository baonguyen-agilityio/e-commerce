import { Router } from "express";
import { validate } from "@/shared/middleware/validate";
import { CategoryController } from "./category.controller";
import {
  createCategorySchema,
  updateCategorySchema,
} from "./category.validation";
import { requireAuth } from "@/shared/middleware/requireAuth";
import { UserRole } from "@/modules/user/entities/User";

export function createCategoryRoutes(controller: CategoryController): Router {
  const router = Router();
  // public routes
  router.get("/", controller.getAllCategories);
  router.get("/:id", controller.getCategoryById);

  // admin routes
  router.post(
    "/",
    requireAuth(UserRole.STAFF),
    validate(createCategorySchema),
    controller.createCategory,
  );
  router.put(
    "/:id",
    requireAuth(UserRole.STAFF),
    validate(updateCategorySchema),
    controller.updateCategory,
  );
  router.delete(
    "/:id",
    requireAuth(UserRole.STAFF),
    controller.deleteCategory,
  );
  return router;
}
