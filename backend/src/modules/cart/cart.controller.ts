import { Response, Request } from "express";
import { asyncHandler } from "../../shared/middleware/asyncHandler";
import { ICartService } from "./cart.interface";

export class CartController {
  constructor(private readonly cartService: ICartService) {}

  getCart = asyncHandler(async (req: Request, res: Response) => {
    const auth = req.auth!;
    const cart = await this.cartService.getCartByClerkId(auth.userId!);
    res.status(200).json(cart);
  })

  addItemToCart = asyncHandler(async (req: Request, res: Response) => {
    const auth = req.auth!;
    const { productId, quantity } = req.body;
    const cartItem = await this.cartService.addItemToCart(auth.userId!, productId, quantity);
    res.status(201).json(cartItem);
  })
}
