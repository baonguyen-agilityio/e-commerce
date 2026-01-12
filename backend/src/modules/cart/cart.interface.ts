import { Cart } from "./entities/Cart";
import { CartItem } from "./entities/CartItem";

export interface CartWithTotal extends Cart {
  subtotal: number;
  itemCount: number;
}

export interface ICartService {
  getOrCreateCart(userId: number): Promise<Cart>;
  getCartByClerkId(clerkId: string): Promise<CartWithTotal>;
  addItemToCart(clerkId: string, productId: number, quantity?: number): Promise<CartItem | null>;
}
