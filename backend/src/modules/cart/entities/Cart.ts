import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";
import { CartItem } from "./CartItem";
import { User } from "@/modules/user/entities/User";

@Entity("carts")
export class Cart {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ type: "varchar", unique: true })
  clerkId: string;

  @OneToOne(() => User, (user) => user.cart, { onDelete: "CASCADE" })
  @JoinColumn({ name: "clerkId", referencedColumnName: "clerkId" })
  user: User;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => CartItem, (item) => item.cart, { cascade: true })
  items: CartItem[];
}
