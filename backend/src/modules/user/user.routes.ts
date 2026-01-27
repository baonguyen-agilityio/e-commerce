import { Router } from "express";
import { UserController } from "./user.controller";
import { requireAuth } from "@/shared/middleware/requireAuth";
import { UserRole } from "./entities/User";
import { validate } from "@/shared/middleware/validate";
import { changeRoleSchema } from "./user.validation";

export function createUserRoutes(controller: UserController): Router {
  const router = Router();

  router.get("/me", requireAuth(), controller.getMe);
  router.get("/", requireAuth(UserRole.STAFF), controller.getAllUsers);
  router.post(
    "/change-role/:clerkId",
    requireAuth(UserRole.ADMIN),
    validate(changeRoleSchema),
    controller.changeRole,
  );
  router.delete(
    "/:clerkId",
    requireAuth(UserRole.ADMIN),
    controller.deleteUser,
  );

  router.post(
    "/ban/:clerkId",
    requireAuth(UserRole.ADMIN),
    controller.toggleBan,
  );

  router.post(
    "/restore/:clerkId",
    requireAuth(UserRole.ADMIN),
    controller.restoreUser,
  );

  router.post(
    "/lock/:clerkId",
    requireAuth(UserRole.ADMIN),
    controller.toggleLock,
  );

  return router;
}
