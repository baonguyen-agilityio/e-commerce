import { Router } from "express";
import { validate } from "../../shared/middleware/validate";
import { CategoryController } from "./category.controller";
import {
  createCategorySchema,
  updateCategorySchema,
} from "./category.validation";
import { requireAuth } from "../../shared/middleware/requireAuth";
import { UserRole } from "../user/entities/User";

export function createCategoryRoutes(controller: CategoryController): Router {
  const router = Router();
  // public routes
  router.get("/", controller.getAllCategories);
  router.get("/:id", controller.getCategoryById);

  // admin routes
  router.post(
    "/",
    requireAuth(UserRole.ADMIN),
    validate(createCategorySchema),
    controller.createCategory,
  );
  router.put(
    "/:id",
    requireAuth(UserRole.ADMIN),
    validate(updateCategorySchema),
    controller.updateCategory,
  );
  router.delete(
    "/:id",
    requireAuth(UserRole.ADMIN),
    controller.deleteCategory,
  );
  return router;
}
