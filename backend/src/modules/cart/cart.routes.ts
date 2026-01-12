import { Router, Request, Response } from "express";
import { requireAuth } from "../../shared/middleware/requireAuth";
import { CartController } from "./cart.controller";

export function createCartRoutes(controller: CartController): Router {
  const router = Router();

  router.get("/", requireAuth(), controller.getCart);
  router.post("/items", requireAuth(), controller.addItemToCart);
  router.put("/items/:id", requireAuth(), (req: Request, res: Response) => {
    res.status(200).json({ message: "Hello from cart routes" });
  });
  router.delete("/items/:id", requireAuth(), (req: Request, res: Response) => {
    res.status(200).json({ message: "Hello from cart routes" });
  });

  return router;
}
