import { Response, Request } from "express";
import { ICartService } from "./cart.interface";
import { getAuthContext } from "@shared/dtos/AuthContext";

export class CartController {
  constructor(private readonly cartService: ICartService) { }

  getCart = async (req: Request, res: Response) => {
    const authContext = getAuthContext(req);
    const cart = await this.cartService.getCartByClerkId(authContext.userId);
    res.status(200).json(cart);
  };

  addItemToCart = async (req: Request, res: Response) => {
    const authContext = getAuthContext(req);
    const { publicId, quantity } = req.body;
    const cartItem = await this.cartService.addItemToCart(
      authContext.userId,
      publicId,
      quantity,
    );
    res.status(201).json(cartItem);
  };

  updateItemQuantity = async (req: Request, res: Response) => {
    const authContext = getAuthContext(req);
    const publicId = req.params.publicId;
    const { quantity } = req.body;
    const cartItem = await this.cartService.updateItemQuantity(
      authContext.userId,
      publicId,
      quantity,
    );
    res.status(200).json(cartItem);
  };

  removeItemFromCart = async (req: Request, res: Response) => {
    const authContext = getAuthContext(req);
    const publicId = req.params.publicId;
    const cart = await this.cartService.removeItemFromCart(authContext.userId, publicId);
    res.status(200).json(cart);
  };

  clearCart = async (req: Request, res: Response) => {
    const authContext = getAuthContext(req);
    const cart = await this.cartService.clearCart(authContext.userId);
    res.status(200).json(cart);
  };
}
