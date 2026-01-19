import { Repository } from "typeorm";
import { CartWithTotal, ICartService } from "./cart.interface";
import { Cart } from "./entities/Cart";
import { CartItem } from "./entities/CartItem";
import { Product } from "../product/entities/Product";
import { User } from "../user/entities/User";
import { BadRequestError, NotFoundError } from "../../shared/errors";
import { ErrorMessages } from "../../shared/errors/messages";

export class CartService implements ICartService {
  constructor(
    private readonly cartRepository: Repository<Cart>,
    private readonly cartItemRepository: Repository<CartItem>,
    private readonly productRepository: Repository<Product>,
    private readonly userRepository: Repository<User>,
  ) {}

  private async findUserOrThrow(clerkId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { clerkId },
    });
    if (!user) {
      throw new NotFoundError(ErrorMessages.USER_NOT_FOUND);
    }
    return user;
  }

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
    const user = await this.findUserOrThrow(clerkId);
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
    const user = await this.findUserOrThrow(clerkId);
    const cart = await this.getOrCreateCart(user.id);

    const product = await this.productRepository.findOne({
      where: { id: productId },
    });
    if (!product || !product.isActive) {
      throw new NotFoundError(ErrorMessages.PRODUCT_NOT_FOUND_OR_NOT_AVAILABLE);
    }

    if (product.stock < quantity) {
      throw new BadRequestError(ErrorMessages.INSUFFICIENT_STOCK_FOR_REQUESTED_PRODUCT);
    }

    let cartItem = await this.cartItemRepository.findOne({
      where: { cartId: cart.id, productId },
      relations: ["product"],
    });

    if (cartItem) {
      const newQuantity = cartItem.quantity + quantity;
      if (product.stock < newQuantity) {
        throw new BadRequestError(ErrorMessages.INSUFFICIENT_STOCK);
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
    const user = await this.findUserOrThrow(clerkId);
    const cart = await this.getOrCreateCart(user.id);

    const cartItem = await this.cartItemRepository.findOne({
      where: { id: cartItemId, cartId: cart.id },
      relations: ["product"],
    });

    if (!cartItem) {
      throw new NotFoundError(ErrorMessages.CART_ITEM_NOT_FOUND);
    }

    if (quantity <= 0) {
      await this.cartItemRepository.delete(cartItem.id);
      return null;
    }

    if (cartItem.product.stock < quantity) {
      throw new BadRequestError(ErrorMessages.INSUFFICIENT_STOCK_FOR_REQUESTED_PRODUCT);
    }

    cartItem.quantity = quantity;
    return this.cartItemRepository.save(cartItem);
  }

  async removeItemFromCart(clerkId: string, cartItemId: number): Promise<boolean> {
    const user = await this.findUserOrThrow(clerkId);
    const cart = await this.getOrCreateCart(user.id);

    const cartItem = await this.cartItemRepository.findOne({
      where: { id: cartItemId, cartId: cart.id },
    });

    if (!cartItem) {
      throw new NotFoundError(ErrorMessages.CART_ITEM_NOT_FOUND);
    }

    await this.cartItemRepository.delete(cartItem.id);
    return true;
  }

  async clearCart(clerkId: string): Promise<boolean> {
    const user = await this.findUserOrThrow(clerkId);
    const cart = await this.getOrCreateCart(user.id);

    await this.cartItemRepository.delete({ cartId: cart.id });
    return true;
  }
}
