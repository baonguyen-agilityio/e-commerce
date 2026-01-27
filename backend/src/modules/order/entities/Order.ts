import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  BeforeInsert,
} from "typeorm";
import { randomUUID } from "node:crypto";
import { OrderItem } from "./OrderItem";
import { User } from "@/modules/user/entities/User";

export enum OrderStatus {
  PENDING_PAYMENT = "PENDING_PAYMENT",
  PAID = "PAID",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
}

@Entity("orders")
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ type: "varchar", unique: true })
  publicId: string;

  @Index()
  @Column({ type: "int" })
  userId: number;

  @ManyToOne(() => User, (user) => user.orders, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: User;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  total: number;

  @Column({
    type: "enum",
    enum: OrderStatus,
    default: OrderStatus.PENDING_PAYMENT,
  })
  status: OrderStatus;

  @Column({ type: "varchar", nullable: true })
  paymentId: string;

  @Index()
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];

  @BeforeInsert()
  generatePublicId() {
    if (!this.publicId) {
      this.publicId = randomUUID();
    }
  }
}
