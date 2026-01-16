import { Request, Response } from "express";
import { Router } from "express";
import { requireAuth } from "../../shared/middleware/requireAuth";
import { UserRole } from "../user/entities/User";
import { OrderController } from "./order.controller";

export function createOrderRoutes(controller: OrderController): Router {

  const router = Router();

  router.post("/", requireAuth(), controller.checkoutOrder);
  router.get("/", requireAuth(UserRole.ADMIN), controller.getOrders);
  router.get("/me",requireAuth(), controller.getOrdersByUser);
  router.get("/:orderId",requireAuth(), controller.getOrderById);

  return router;
}