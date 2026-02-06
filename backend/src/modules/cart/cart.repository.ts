import { Repository } from "typeorm";
import { BaseRepository } from "@/shared/repositories/BaseRepository";
import { IBaseRepository } from "@/shared/repositories/IBaseRepository";
import { Cart } from "./entities/Cart";
import { CartItem } from "./entities/CartItem";

/**
 * Cart repository interface with domain-specific methods
 */
export interface ICartRepository extends IBaseRepository<Cart> {
    findByClerkIdWithItems(clerkId: string): Promise<Cart | null>;
    findOrCreateByClerkId(clerkId: string): Promise<Cart>;
}

/**
 * Cart repository implementation
 */
export class CartRepository
    extends BaseRepository<Cart>
    implements ICartRepository {
    constructor(repository: Repository<Cart>) {
        super(repository);
    }

    protected getEntityName(): string {
        return "Cart";
    }

    async findByClerkIdWithItems(clerkId: string): Promise<Cart | null> {
        return this.findOne({
            where: { clerkId },
            relations: ["items", "items.product", "items.product.category"],
        });
    }

    async findOrCreateByClerkId(clerkId: string): Promise<Cart> {
        let cart = await this.findByClerkIdWithItems(clerkId);

        if (!cart) {
            cart = this.create({
                clerkId,
                items: [],
            });
            await this.save(cart);
        }

        return cart;
    }
}

/**
 * CartItem repository interface with domain-specific methods
 */
export interface ICartItemRepository extends IBaseRepository<CartItem> {
    findByCartAndProduct(cartId: number, productId: number): Promise<CartItem | null>;
    findAllByCart(cartId: number): Promise<CartItem[]>;
    deleteByCart(cartId: number): Promise<void>;
    findByCartItemIdAndCartId(cartItemId: string, cartId: number): Promise<CartItem | null>;
    deleteById(id: number): Promise<void>;
}

/**
 * CartItem repository implementation
 */
export class CartItemRepository
    extends BaseRepository<CartItem>
    implements ICartItemRepository {
    constructor(repository: Repository<CartItem>) {
        super(repository);
    }

    protected getEntityName(): string {
        return "CartItem";
    }

    async findByCartAndProduct(
        cartId: number,
        productId: number
    ): Promise<CartItem | null> {
        return this.findOne({
            where: {
                cart: { id: cartId },
                product: { id: productId },
            },
            relations: ["product"],
        });
    }

    async findAllByCart(cartId: number): Promise<CartItem[]> {
        return this.find({
            where: { cart: { id: cartId } },
            relations: ["product", "product.category"],
        });
    }

    async deleteByCart(cartId: number): Promise<void> {
        await this.repository.delete({ cart: { id: cartId } });
    }

    async findByCartItemIdAndCartId(
        cartItemId: string,
        cartId: number
    ): Promise<CartItem | null> {
        return this.findOne({
            where: {
                cartItemId,
                cart: { id: cartId }
            },
            relations: ["product"]
        });
    }

    async deleteById(id: number): Promise<void> {
        await this.repository.delete(id);
    }
}
