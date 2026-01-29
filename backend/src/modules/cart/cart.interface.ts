import { Cart } from "./entities/Cart";
import { CartItem } from "./entities/CartItem";

export interface CartWithTotal extends Cart {
  subtotal: number;
  itemCount: number;
}

export interface ICartService {
  getOrCreateCart(clerkId: string): Promise<Cart>;
  getCartByClerkId(clerkId: string): Promise<CartWithTotal>;
  addItemToCart(clerkId: string, publicId: string, quantity?: number): Promise<CartItem>;
  updateItemQuantity(
    clerkId: string,
    publicId: string,
    quantity: number,
  ): Promise<CartItem>;
  removeItemFromCart(clerkId: string, publicId: string): Promise<CartWithTotal>;
  clearCart(clerkId: string): Promise<CartWithTotal>;
}
