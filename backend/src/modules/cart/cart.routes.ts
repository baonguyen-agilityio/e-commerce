import { Router } from "express";
import { validate } from "@/shared/middleware/validate";
import { requireAuth } from "@/shared/middleware/requireAuth";
import { CartController } from "./cart.controller";
import { addItemSchema, updateQuantitySchema } from "./cart.validation";

export function createCartRoutes(controller: CartController): Router {
  const router = Router();

  router.get("/", requireAuth(), controller.getCart);
  router.delete("/", requireAuth(), controller.clearCart);
  router.post("/items", requireAuth(), validate(addItemSchema), controller.addItemToCart);
  router.put("/items/:publicId", requireAuth(), validate(updateQuantitySchema), controller.updateItemQuantity);
  router.delete("/items/:publicId", requireAuth(), controller.removeItemFromCart);

  return router;
}
