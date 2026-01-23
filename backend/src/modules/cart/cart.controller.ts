import { Response, Request } from "express";
import { asyncHandler } from "../../shared/middleware/asyncHandler";
import { ICartService } from "./cart.interface";
import { getAuthContext } from "../../shared/dtos/AuthContext";

export class CartController {
  constructor(private readonly cartService: ICartService) { }

  getCart = asyncHandler(async (req: Request, res: Response) => {
    const authContext = getAuthContext(req);
    const cart = await this.cartService.getCartByClerkId(authContext.userId);
    res.status(200).json(cart);
  });

  addItemToCart = asyncHandler(async (req: Request, res: Response) => {
    const authContext = getAuthContext(req);
    const { productId, quantity } = req.body;
    const cartItem = await this.cartService.addItemToCart(
      authContext.userId,
      productId,
      quantity,
    );
    res.status(201).json(cartItem);
  });

  updateItemQuantity = asyncHandler(async (req: Request, res: Response) => {
    const authContext = getAuthContext(req);
    const cartItemId = parseInt(req.params.id, 10);
    const { quantity } = req.body;
    const cartItem = await this.cartService.updateItemQuantity(
      authContext.userId,
      cartItemId,
      quantity,
    );
    res.status(200).json(cartItem);
  });

  removeItemFromCart = asyncHandler(async (req: Request, res: Response) => {
    const authContext = getAuthContext(req);
    const cartItemId = parseInt(req.params.id, 10);
    const cart = await this.cartService.removeItemFromCart(authContext.userId, cartItemId);
    res.status(200).json(cart);
  });

  clearCart = asyncHandler(async (req: Request, res: Response) => {
    const authContext = getAuthContext(req);
    const cart = await this.cartService.clearCart(authContext.userId);
    res.status(200).json(cart);
  });
}
