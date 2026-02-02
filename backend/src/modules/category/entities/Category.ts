import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  BeforeInsert,
} from "typeorm";
import { randomUUID } from "node:crypto";
import { Product } from "@/modules/product/entities/Product";

@Entity("categories")
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ type: "varchar", unique: true })
  categoryId: string;

  @Index()
  @Column({ type: "varchar" })
  name: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];

  @BeforeInsert()
  generateCategoryId() {
    if (!this.categoryId) {
      this.categoryId = randomUUID();
    }
  }
}
