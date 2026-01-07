import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "../../product/entities/Product";

@Entity('categories')
export class Category {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar' })
    name: string;
    
    @Column({ type: 'text', nullable: true })
    description: string;

    @OneToMany(() => Product, (product) => product.category)
    products: Product[];
}