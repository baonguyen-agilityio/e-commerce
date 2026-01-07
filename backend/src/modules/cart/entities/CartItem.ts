import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Cart } from "./Cart";
import { Product } from "../../product/entities/Product";

@Entity('cart_items')
@Unique(['cartId', 'productId'])
export class CartItem {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int' })
    cartId: number;

    @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'cartId' })
    cart: Cart;

    @Column({ type: 'int' })
    productId: number;

    @ManyToOne(() => Product, (product) => product.cartItems, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'productId' })
    product: Product;

    @Column({ type: 'int', default: 1 })
    quantity: number;
}