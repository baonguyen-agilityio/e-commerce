import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
} from "typeorm";
import { randomUUID } from "node:crypto";
import { Category } from "@/modules/category/entities/Category";
import { CartItem } from "@/modules/cart/entities/CartItem";
import { OrderItem } from "@/modules/order/entities/OrderItem";

@Entity("products")
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ type: "varchar", unique: true })
  publicId: string;

  @Index()
  @Column({ type: "varchar" })
  name: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Index()
  @Column({ type: "decimal", precision: 10, scale: 2 })
  price: number;

  @Column({ type: "int", default: 0 })
  stock: number;

  @Column({ type: "varchar", nullable: true })
  imageUrl: string;

  @Index()
  @Column({ type: "int" })
  categoryId: number;

  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn({ name: "categoryId" })
  category: Category;

  @Index()
  @Column({ type: "boolean", default: true })
  isActive: boolean;

  @Index()
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;

  @OneToMany(() => CartItem, (cartItem) => cartItem.product)
  cartItems: CartItem[];

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orderItems: OrderItem[];

  @BeforeInsert()
  @BeforeUpdate()
  generatePublicId() {
    if (!this.publicId) {
      this.publicId = randomUUID();
    }
  }
}
