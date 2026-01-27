import { Router } from "express";
import { requireAuth } from "@/shared/middleware/requireAuth";
import { UserRole } from "@/modules/user/entities/User";
import { OrderController } from "./order.controller";

import { checkoutLimiter } from "@/shared/middleware/rateLimiter";

export function createOrderRoutes(controller: OrderController): Router {
  const router = Router();

  router.post("/", checkoutLimiter, requireAuth(), controller.checkoutOrder);
  router.get("/", requireAuth(UserRole.ADMIN), controller.getOrders);
  router.get("/me", requireAuth(), controller.getOrdersByUser);
  router.get("/:orderId", requireAuth(), controller.getOrderById);

  return router;
}
