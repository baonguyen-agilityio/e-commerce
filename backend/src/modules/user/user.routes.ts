import { Router } from "express";
import { UserController } from "./user.controller";
import { requireAuth } from "../../shared/middleware/requireAuth";
import { UserRole } from "./entities/User";

export function createUserRoutes(controller: UserController): Router {
  const router = Router();

  router.get("/me", requireAuth(), controller.getMe);
  router.post(
    "/set-admin/:clerkId",
    requireAuth(UserRole.ADMIN),
    controller.setAdmin,
  );

  return router;
}
