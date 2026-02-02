import { Repository } from "typeorm";
import { CartWithTotal, ICartService } from "./cart.interface";
import { Cart } from "./entities/Cart";
import { CartItem } from "./entities/CartItem";
import { BadRequestError, NotFoundError } from "@/shared/errors";
import { ErrorMessages } from "@/shared/errors/messages";
import { Product } from "@/modules/product/entities/Product";

export class CartService implements ICartService {
  constructor(
    private readonly cartRepository: Repository<Cart>,
    private readonly cartItemRepository: Repository<CartItem>,
    private readonly productRepository: Repository<Product>,
  ) { }

  async getOrCreateCart(clerkId: string): Promise<Cart> {
    let cart = await this.cartRepository.findOne({
      where: { clerkId },
      relations: ["items", "items.product"],
    });

    if (!cart) {
      cart = this.cartRepository.create({
        clerkId,
        items: [],
      });
      await this.cartRepository.save(cart);
    }

    return cart;
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

    const product = await this.productRepository.findOne({
      where: { productId },
    });
    if (!product || !product.isActive) {
      throw new NotFoundError(ErrorMessages.PRODUCT_NOT_FOUND_OR_NOT_AVAILABLE);
    }

    if (product.stock < quantity) {
      throw new BadRequestError(ErrorMessages.INSUFFICIENT_STOCK_FOR_REQUESTED_PRODUCT);
    }

    let cartItem = await this.cartItemRepository.findOne({
      where: { cart: { id: cart.id }, product: { id: product.id } },
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
        cart,
        product,
        quantity,
      });

    }

    return this.cartItemRepository.save(cartItem);
  }

  async updateItemQuantity(
    clerkId: string,
    cartItemId: string,
    quantity: number,
  ): Promise<CartItem> {
    const cart = await this.getOrCreateCart(clerkId);

    const cartItem = await this.cartItemRepository.findOne({
      where: { cartItemId, cart: { id: cart.id } },
      relations: ["product"],
    });

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
    return this.cartItemRepository.save(cartItem);
  }

  async removeItemFromCart(clerkId: string, cartItemId: string): Promise<CartWithTotal> {
    const cart = await this.getOrCreateCart(clerkId);

    const cartItem = await this.cartItemRepository.findOne({
      where: { cartItemId, cart: { id: cart.id } },
    });

    if (!cartItem) {
      throw new NotFoundError(ErrorMessages.CART_ITEM_NOT_FOUND);
    }

    await this.cartItemRepository.delete(cartItem.id);

    return this.getCartByClerkId(clerkId);
  }

  async clearCart(clerkId: string): Promise<CartWithTotal> {
    const cart = await this.getOrCreateCart(clerkId);

    await this.cartItemRepository.delete({ cart: { id: cart.id } });

    return this.getCartByClerkId(clerkId);
  }
}
