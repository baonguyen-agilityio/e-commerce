import { Router } from "express";
import { validate } from "@/shared/middleware/validate";
import { requireAuth } from "@/shared/middleware/requireAuth";
import { CartController } from "./cart.controller";
import { addItemToCartSchema, updateItemQuantitySchema } from "./cart.validation";

export function createCartRoutes(controller: CartController): Router {
  const router = Router();

  router.get("/", requireAuth(), controller.getCart);
  router.delete("/", requireAuth(), controller.clearCart);
  router.post("/items", requireAuth(), validate(addItemToCartSchema), controller.addItemToCart);
  router.put("/items/:publicId", requireAuth(), validate(updateItemQuantitySchema), controller.updateItemQuantity);
  router.delete("/items/:publicId", requireAuth(), controller.removeItemFromCart);

  return router;
}
