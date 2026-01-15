import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  OneToMany,
} from "typeorm";
import { Cart } from "../../cart/entities/Cart";
import { Order } from "../../order/entities/Order";

export enum UserRole {
  CUSTOMER = "customer",
  STAFF = "staff",
  ADMIN = "admin",
  SUPER_ADMIN = "super_admin",
}

export const ROLE_HIERARCHY: UserRole[] = [
  UserRole.CUSTOMER,
  UserRole.STAFF,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
]

export function getRoleLevel(role: UserRole): number {
  return ROLE_HIERARCHY.indexOf(role);
}

export function hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
  return getRoleLevel(userRole) >= getRoleLevel(requiredRole);
}

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", unique: true })
  clerkId: string;

  @Column({ type: "varchar" })
  email: string;

  @Column({ type: "varchar", nullable: true })
  name: string;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.CUSTOMER,
  })
  role: UserRole;

  @Column({ type: "boolean", default: false })
  isBanned: boolean;

  @Column({ type: "boolean", default: false })
  isLocked: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @OneToOne(() => Cart, (cart) => cart.user, {onDelete: "CASCADE"})
  cart: Cart;

  @OneToMany(() => Order, (order) => order.user, {onDelete: "CASCADE"})
  orders: Order[];
}
