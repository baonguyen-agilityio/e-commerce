import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    Unique,
    Index,
    BeforeInsert,
} from "typeorm";
import { randomUUID } from "node:crypto";
import { Cart } from "./Cart";
import { Product } from "@/modules/product/entities/Product";

@Entity('cart_items')
@Unique(['cart', 'product'])
export class CartItem {
    @PrimaryGeneratedColumn()
    id: number;

    @Index({ unique: true })
    @Column({ type: "varchar", unique: true })
    cartItemId: string;

    @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'cartId' })
    cart: Cart;

    @ManyToOne(() => Product, (product) => product.cartItems, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'productId' })
    product: Product;

    @Column({ type: 'int', default: 1 })
    quantity: number;

    @BeforeInsert()
    generateCartItemId() {
        if (!this.cartItemId) {
            this.cartItemId = randomUUID();
        }
    }
}