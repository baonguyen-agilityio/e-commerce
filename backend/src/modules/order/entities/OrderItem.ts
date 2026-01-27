import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Order } from "./Order";
import { Product } from "@/modules/product/entities/Product";

@Entity('order_items')
@Unique(['orderId', 'productId'])
export class OrderItem {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int' })
    orderId: number;

    @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'orderId' })
    order: Order;

    @Column({ type: 'int' })
    productId: number;

    @ManyToOne(() => Product, (product) => product.orderItems, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'productId' })
    product: Product;

    @Column({ type: 'int', default: 1 })
    quantity: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    priceAtPurchase: number;
}