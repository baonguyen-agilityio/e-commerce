import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  OneToOne,
  OneToMany,
  BeforeInsert,
  Index,
  BeforeSoftRemove,
  AfterRecover,
} from "typeorm";
import { clerkClient } from "@clerk/express";
import { InternalError } from "@/shared/errors";
import { Cart } from "@/modules/cart/entities/Cart";
import { Order } from "@/modules/order/entities/Order";

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
];

export function getRoleLevel(role: UserRole): number {
  return ROLE_HIERARCHY.indexOf(role);
}

export function hasPermission(
  userRole: UserRole,
  requiredRole: UserRole,
): boolean {
  return getRoleLevel(userRole) >= getRoleLevel(requiredRole);
}

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", unique: true })
  userId: string;

  @Column({ type: "varchar", unique: true })
  clerkId: string;

  @Index()
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

  @DeleteDateColumn()
  deletedAt: Date | null;

  @OneToOne(() => Cart, (cart) => cart.user, { onDelete: "CASCADE" })
  cart: Cart;

  @OneToMany(() => Order, (order) => order.user, { onDelete: "CASCADE" })
  orders: Order[];

  @BeforeInsert()
  generateUserId() {
    if (!this.userId) {
      this.userId = this.clerkId;
    }
  }

  @BeforeSoftRemove()
  async banInClerk() {
    if (!this.isBanned) {
      try {
        await clerkClient.users.banUser(this.clerkId);
      } catch (error) {
        throw new InternalError(
          "Cloud identity sync failed: Unable to ban user in Clerk",
        );
      }
    }
  }

  @AfterRecover()
  async unbanInClerk() {
    if (!this.isBanned) {
      try {
        await clerkClient.users.unbanUser(this.clerkId);
      } catch (error) {
        throw new InternalError(
          "Cloud identity sync failed: Unable to unban user in Clerk",
        );
      }
    }
  }
}
