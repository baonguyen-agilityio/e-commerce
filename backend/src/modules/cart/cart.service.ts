import { Repository } from "typeorm";
import { CartWithTotal, ICartService } from "./cart.interface";
import { Cart } from "./entities/Cart";
import { CartItem } from "./entities/CartItem";
import { Product } from "../product/entities/Product";
import { User } from "../user/entities/User";
import { AppError } from "../../shared/middleware/errorHandler";

export class CartService implements ICartService {
  constructor(
    private readonly cartRepository: Repository<Cart>,
    private readonly cartItemRepository: Repository<CartItem>,
    private readonly productRepository: Repository<Product>,
    private readonly userRepository: Repository<User>,
  ) {}

  async getOrCreateCart(userId: number): Promise<Cart> {
    let cart = await this.cartRepository.findOne({
      where: { userId },
      relations: ["items", "items.product"],
    });

    if (!cart) {
      cart = this.cartRepository.create({ userId, items: [] });
      await this.cartRepository.save(cart);
    }

    return cart;
  }

  async getCartByClerkId(clerkId: string): Promise<CartWithTotal> {
    const user = await this.userRepository.findOne({
      where: { clerkId },
    });
    if (!user) {
      throw new AppError(404, "Cart not found");
    }

    const cart = await this.getOrCreateCart(user.id);

    let subtotal = 0;
    let itemCount = 0;

    for (const item of cart.items || []) {
      subtotal += item.product.price * item.quantity;
      itemCount += item.quantity;
    }

    return {
      ...cart,
      subtotal: Math.round(subtotal * 100) / 100,
      itemCount,
    };
  }

  async addItemToCart(clerkId: string, productId: number, quantity: number = 1): Promise<CartItem | null> {
    const user = await this.userRepository.findOne({
      where: { clerkId },
    });
    if (!user) {
      throw new AppError(404, "Cart not found");
    }

    const cart = await this.getOrCreateCart(user.id);

    const product = await this.productRepository.findOne({
      where: { id: productId },
    });
    if (!product || !product.isActive) {
      throw new AppError(404, "Product not found or not available");
    }

    if (product.stock < quantity) {
      throw new AppError(400, "Insufficient stock for the requested product");
    }

    let cartItem = await this.cartItemRepository.findOne({
      where: { cartId: cart.id, productId },
      relations: ["product"],
    });

    if (cartItem) {
      const newQuantity = cartItem.quantity + quantity;
      if (product.stock < newQuantity) {
        throw new Error('Insufficient stock');
      }
      cartItem.quantity = newQuantity;
    } else {
      cartItem = this.cartItemRepository.create({
        cartId: cart.id,
        productId,
        quantity,
      });
    }

    await this.cartItemRepository.save(cartItem);
    return this.cartItemRepository.findOne({
      where: { id: cartItem.id },
      relations: ['product'],
    });
  }

  async updateItemQuantity(
    clerkId: string,
    cartItemId: number,
    quantity: number,
  ): Promise<CartItem | null> {
    const user = await this.userRepository.findOne({
      where: { clerkId },
    });
    if (!user) {
      throw new AppError(404, "Cart not found");
    }

    const cart = await this.getOrCreateCart(user.id);

    const cartItem = await this.cartItemRepository.findOne({
      where: { id: cartItemId, cartId: cart.id },
      relations: ["product"],
    });

    if (!cartItem) {
      throw new AppError(404, "Cart item not found");
    }

    if (quantity <= 0) {
      await this.cartItemRepository.delete(cartItem);
      return null;
    }

    if (cartItem.product.stock < quantity) {
      throw new AppError(400, "Insufficient stock for the requested product");
    }

    cartItem.quantity = quantity;
    return this.cartItemRepository.save(cartItem);
  }

  async removeItemFromCart(clerkId: string, cartItemId: number): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { clerkId },
    });
    if (!user) {
      throw new AppError(404, "Cart not found");
    }

    const cart = await this.getOrCreateCart(user.id);

    const cartItem = await this.cartItemRepository.findOne({
      where: { id: cartItemId, cartId: cart.id },
    });

    if (!cartItem) {
      throw new AppError(404, "Cart item not found");
    }

    await this.cartItemRepository.delete(cartItem);
    return true;
  }

  async clearCart(clerkId: string): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { clerkId },
    });
    if (!user) {
      throw new AppError(404, "Cart not found");
    }

    const cart = await this.getOrCreateCart(user.id);

    await this.cartItemRepository.delete({ cartId: cart.id });
    return true;
  }
}
