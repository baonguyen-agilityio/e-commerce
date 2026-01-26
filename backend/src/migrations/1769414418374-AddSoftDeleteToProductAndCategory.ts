import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSoftDeleteToProductAndCategory1769414418374 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add columns to products table
        await queryRunner.query(`ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP`);

        // Add columns to categories table
        await queryRunner.query(`ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN IF EXISTS "deletedAt"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN IF EXISTS "createdAt"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN IF EXISTS "deletedAt"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN IF EXISTS "updatedAt"`);
    }

}
