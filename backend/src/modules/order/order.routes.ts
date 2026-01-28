import { Router } from "express";
import { requireAuth } from "@/shared/middleware/requireAuth";
import { UserRole } from "@/modules/user/entities/User";
import { OrderController } from "./order.controller";

import { checkoutLimiter } from "@/shared/middleware/rateLimiter";
import { validate } from "@/shared/middleware/validate";
import { createOrderSchema, orderQuerySchema } from "./order.validation";

export function createOrderRoutes(controller: OrderController): Router {
  const router = Router();

  router.post("/", checkoutLimiter, requireAuth(), validate(createOrderSchema), controller.checkoutOrder);
  router.get("/", requireAuth(UserRole.ADMIN), validate(orderQuerySchema, "query"), controller.getOrders);
  router.get("/me", requireAuth(), validate(orderQuerySchema, "query"), controller.getOrdersByUser);
  router.get("/:orderId", requireAuth(), controller.getOrderById);

  return router;
}
