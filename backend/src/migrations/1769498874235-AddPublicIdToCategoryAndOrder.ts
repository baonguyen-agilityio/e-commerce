import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPublicIdToCategoryAndOrder1769498874235 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Add nullable columns first if they don't exist
        await queryRunner.query(`ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "publicId" character varying`);
        await queryRunner.query(`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "publicId" character varying`);

        // 2. Ensure pgcrypto for random generation
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

        // 3. Populate existing rows
        await queryRunner.query(`UPDATE "categories" SET "publicId" = gen_random_uuid()::text WHERE "publicId" IS NULL`);
        await queryRunner.query(`UPDATE "orders" SET "publicId" = gen_random_uuid()::text WHERE "publicId" IS NULL`);

        // 4. Make it NOT NULL (Check if already not null is hard with raw SQL, but TypeORM or Postgres will handle)
        await queryRunner.query(`ALTER TABLE "categories" ALTER COLUMN "publicId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "publicId" SET NOT NULL`);

        // 5. Add constraints & indexes safely
        const tableCat = await queryRunner.getTable("categories");
        if (tableCat && !tableCat.uniques.find(u => u.name === "UQ_categories_publicId")) {
            await queryRunner.query(`ALTER TABLE "categories" ADD CONSTRAINT "UQ_categories_publicId" UNIQUE ("publicId")`);
        }
        await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_categories_publicId" ON "categories" ("publicId")`);

        const tableOrder = await queryRunner.getTable("orders");
        if (tableOrder && !tableOrder.uniques.find(u => u.name === "UQ_orders_publicId")) {
            await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "UQ_orders_publicId" UNIQUE ("publicId")`);
        }
        await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_orders_publicId" ON "orders" ("publicId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_orders_publicId"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "UQ_orders_publicId"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "publicId"`);

        await queryRunner.query(`DROP INDEX "IDX_categories_publicId"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT "UQ_categories_publicId"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "publicId"`);
    }
}
