import { CartWithTotal, ICartService } from "./cart.interface";
import { ICartItemRepository, ICartRepository } from "./cart.repository";
import { IProductRepository } from "@modules/product/product.repository";
import { Cart } from "./entities/Cart";
import { CartItem } from "./entities/CartItem";
import { BadRequestError, NotFoundError } from "@/shared/errors";
import { ErrorMessages } from "@/shared/errors/messages";
import { Product } from "@/modules/product/entities/Product";
import { loggers } from "@shared/utils/logger";

export class CartService implements ICartService {
  constructor(
    private readonly cartRepository: ICartRepository,
    private readonly cartItemRepository: ICartItemRepository,
    private readonly productRepository: IProductRepository,
  ) { }

  async getOrCreateCart(clerkId: string): Promise<Cart> {
    return this.cartRepository.findOrCreateByClerkId(clerkId);
  }

  async getCartByClerkId(clerkId: string): Promise<CartWithTotal> {
    const cart = await this.getOrCreateCart(clerkId);

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

  async addItemToCart(clerkId: string, productId: string, quantity: number = 1): Promise<CartItem> {
    const cart = await this.getOrCreateCart(clerkId);

    const product = await this.productRepository.findByProductId(productId);
    if (!product || !product.isActive) {
      throw new NotFoundError(ErrorMessages.PRODUCT_NOT_FOUND_OR_NOT_AVAILABLE);
    }

    if (product.stock < quantity) {
      throw new BadRequestError(ErrorMessages.INSUFFICIENT_STOCK_FOR_REQUESTED_PRODUCT);
    }

    let cartItem = await this.cartItemRepository.findByCartAndProduct(cart.id, product.id);

    if (cartItem) {
      const newQuantity = cartItem.quantity + quantity;
      if (product.stock < newQuantity) {
        throw new BadRequestError(ErrorMessages.INSUFFICIENT_STOCK);
      }
      cartItem.quantity = newQuantity;
    } else {
      cartItem = this.cartItemRepository.create({
        cart,
        product,
        quantity,
      });
    }

    loggers.info('Item added to cart', {
      context: 'CartService',
      userId: clerkId,
      productId,
      quantity,
    });

    return this.cartItemRepository.save(cartItem);
  }

  async updateItemQuantity(
    clerkId: string,
    cartItemId: string,
    quantity: number,
  ): Promise<CartItem> {
    const cart = await this.getOrCreateCart(clerkId);

    const cartItem = await this.cartItemRepository.findByCartItemIdAndCartId(cartItemId, cart.id);

    if (!cartItem) {
      throw new NotFoundError(ErrorMessages.CART_ITEM_NOT_FOUND);
    }

    if (quantity <= 0) {
      throw new BadRequestError("Quantity must be at least 1. Use removeItemFromCart to delete items.");
    }

    if (cartItem.product.stock < quantity) {
      throw new BadRequestError(ErrorMessages.INSUFFICIENT_STOCK_FOR_REQUESTED_PRODUCT);
    }

    cartItem.quantity = quantity;

    loggers.info('Cart item quantity updated', {
      context: 'CartService',
      userId: clerkId,
      cartItemId,
      newQuantity: quantity
    });

    return this.cartItemRepository.save(cartItem);
  }

  async removeItemFromCart(clerkId: string, cartItemId: string): Promise<CartWithTotal> {
    const cart = await this.getOrCreateCart(clerkId);

    const cartItem = await this.cartItemRepository.findByCartItemIdAndCartId(
      cartItemId,
      cart.id
    );

    if (!cartItem) {
      throw new NotFoundError(ErrorMessages.CART_ITEM_NOT_FOUND);
    }

    await this.cartItemRepository.deleteById(cartItem.id);

    loggers.info('Item removed from cart', {
      context: 'CartService',
      userId: clerkId,
      cartItemId,
    });

    return this.getCartByClerkId(clerkId);
  }

  async clearCart(clerkId: string): Promise<CartWithTotal> {
    const cart = await this.getOrCreateCart(clerkId);

    await this.cartItemRepository.deleteByCart(cart.id);

    loggers.info('Cart cleared', {
      context: 'CartService',
      userId: clerkId,
    });

    return this.getCartByClerkId(clerkId);
  }
}
