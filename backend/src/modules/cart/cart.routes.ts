import { Router, Request, Response } from "express";
import { requireAuth } from "../../shared/middleware/requireAuth";
import { CartController } from "./cart.controller";
import { validate } from "../../shared/middleware/validate";
import { addItemToCartSchema, updateItemQuantitySchema } from "./cart.validation";

export function createCartRoutes(controller: CartController): Router {
  const router = Router();

  router.get("/", requireAuth(), controller.getCart);
  router.delete("/", requireAuth(), controller.clearCart);
  router.post("/items", requireAuth(), validate(addItemToCartSchema), controller.addItemToCart);
  router.put("/items/:id", requireAuth(), validate(updateItemQuantitySchema), controller.updateItemQuantity);
  router.delete("/items/:id", requireAuth(), controller.removeItemFromCart);

  return router;
}
