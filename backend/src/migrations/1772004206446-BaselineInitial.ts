import { MigrationInterface, QueryRunner } from "typeorm";

export class BaselineInitial1772004206446 implements MigrationInterface {
    name = 'BaselineInitial1772004206446'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "categories" ("id" SERIAL NOT NULL, "categoryId" character varying NOT NULL, "name" character varying NOT NULL, "description" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "UQ_c9594c262e6781893a1068d91be" UNIQUE ("categoryId"), CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_c9594c262e6781893a1068d91b" ON "categories" ("categoryId") `);
        await queryRunner.query(`CREATE INDEX "IDX_8b0be371d28245da6e4f4b6187" ON "categories" ("name") `);
        await queryRunner.query(`CREATE TYPE "public"."orders_status_enum" AS ENUM('PENDING_PAYMENT', 'PAID', 'FAILED', 'CANCELLED', 'COMPLETED')`);
        await queryRunner.query(`CREATE TABLE "orders" ("id" SERIAL NOT NULL, "orderId" character varying NOT NULL, "total" numeric(10,2) NOT NULL, "status" "public"."orders_status_enum" NOT NULL DEFAULT 'PENDING_PAYMENT', "paymentId" character varying, "failureReason" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "UQ_41ba27842ac1a2c24817ca59eaa" UNIQUE ("orderId"), CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_41ba27842ac1a2c24817ca59ea" ON "orders" ("orderId") `);
        await queryRunner.query(`CREATE INDEX "IDX_1f4b9818a08b822a31493fdee9" ON "orders" ("createdAt") `);
        await queryRunner.query(`CREATE TABLE "order_items" ("id" SERIAL NOT NULL, "quantity" integer NOT NULL DEFAULT '1', "priceAtPurchase" numeric(10,2) NOT NULL, "orderId" integer, "productId" integer, CONSTRAINT "UQ_5dc4f4cfd0b2c11447acab8352c" UNIQUE ("orderId", "productId"), CONSTRAINT "PK_005269d8574e6fac0493715c308" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "products" ("id" SERIAL NOT NULL, "productId" character varying NOT NULL, "name" character varying NOT NULL, "description" text, "price" numeric(10,2) NOT NULL, "stock" integer NOT NULL DEFAULT '0', "imageUrl" character varying, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "categoryId" integer, CONSTRAINT "UQ_7b3b507508cd0f86a5b2e923459" UNIQUE ("productId"), CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_7b3b507508cd0f86a5b2e92345" ON "products" ("productId") `);
        await queryRunner.query(`CREATE INDEX "IDX_4c9fb58de893725258746385e1" ON "products" ("name") `);
        await queryRunner.query(`CREATE INDEX "IDX_75895eeb1903f8a17816dafe0a" ON "products" ("price") `);
        await queryRunner.query(`CREATE INDEX "IDX_ff39b9ac40872b2de41751eedc" ON "products" ("isActive") `);
        await queryRunner.query(`CREATE INDEX "IDX_63fcb3d8806a6efd53dbc67430" ON "products" ("createdAt") `);
        await queryRunner.query(`CREATE TABLE "cart_items" ("id" SERIAL NOT NULL, "cartItemId" character varying NOT NULL, "quantity" integer NOT NULL DEFAULT '1', "cartId" integer, "productId" integer, CONSTRAINT "UQ_9066a7c9058632f82cb918c67c0" UNIQUE ("cartItemId"), CONSTRAINT "UQ_2bf7996b7946ce753b60a87468c" UNIQUE ("cartId", "productId"), CONSTRAINT "PK_6fccf5ec03c172d27a28a82928b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_9066a7c9058632f82cb918c67c" ON "cart_items" ("cartItemId") `);
        await queryRunner.query(`CREATE TABLE "carts" ("id" SERIAL NOT NULL, "clerkId" character varying NOT NULL, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_565f81b441c922ae6283c677428" UNIQUE ("clerkId"), CONSTRAINT "REL_565f81b441c922ae6283c67742" UNIQUE ("clerkId"), CONSTRAINT "PK_b5f695a59f5ebb50af3c8160816" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_565f81b441c922ae6283c67742" ON "carts" ("clerkId") `);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('customer', 'staff', 'admin', 'super_admin')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "userId" character varying NOT NULL, "clerkId" character varying NOT NULL, "email" character varying NOT NULL, "name" character varying, "role" "public"."users_role_enum" NOT NULL DEFAULT 'customer', "isBanned" boolean NOT NULL DEFAULT false, "isLocked" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "UQ_8bf09ba754322ab9c22a215c919" UNIQUE ("userId"), CONSTRAINT "UQ_b0e4d1eb939d0387788678c4f8e" UNIQUE ("clerkId"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_151b79a83ba240b0cb31b2302d1" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_f1d359a55923bb45b057fbdab0d" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_cdb99c05982d5191ac8465ac010" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_ff56834e735fa78a15d0cf21926" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cart_items" ADD CONSTRAINT "FK_edd714311619a5ad09525045838" FOREIGN KEY ("cartId") REFERENCES "carts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cart_items" ADD CONSTRAINT "FK_72679d98b31c737937b8932ebe6" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "carts" ADD CONSTRAINT "FK_565f81b441c922ae6283c677428" FOREIGN KEY ("clerkId") REFERENCES "users"("clerkId") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "carts" DROP CONSTRAINT "FK_565f81b441c922ae6283c677428"`);
        await queryRunner.query(`ALTER TABLE "cart_items" DROP CONSTRAINT "FK_72679d98b31c737937b8932ebe6"`);
        await queryRunner.query(`ALTER TABLE "cart_items" DROP CONSTRAINT "FK_edd714311619a5ad09525045838"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_ff56834e735fa78a15d0cf21926"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_cdb99c05982d5191ac8465ac010"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_f1d359a55923bb45b057fbdab0d"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_151b79a83ba240b0cb31b2302d1"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_565f81b441c922ae6283c67742"`);
        await queryRunner.query(`DROP TABLE "carts"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9066a7c9058632f82cb918c67c"`);
        await queryRunner.query(`DROP TABLE "cart_items"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_63fcb3d8806a6efd53dbc67430"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ff39b9ac40872b2de41751eedc"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_75895eeb1903f8a17816dafe0a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4c9fb58de893725258746385e1"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7b3b507508cd0f86a5b2e92345"`);
        await queryRunner.query(`DROP TABLE "products"`);
        await queryRunner.query(`DROP TABLE "order_items"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1f4b9818a08b822a31493fdee9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_41ba27842ac1a2c24817ca59ea"`);
        await queryRunner.query(`DROP TABLE "orders"`);
        await queryRunner.query(`DROP TYPE "public"."orders_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8b0be371d28245da6e4f4b6187"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c9594c262e6781893a1068d91b"`);
        await queryRunner.query(`DROP TABLE "categories"`);
    }

}
