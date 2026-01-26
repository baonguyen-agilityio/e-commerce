import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIndexesToCommonFieldsManual1769414603938 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Products indexes
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_products_name" ON "products" ("name")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_products_price" ON "products" ("price")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_products_categoryId" ON "products" ("categoryId")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_products_isActive" ON "products" ("isActive")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_products_createdAt" ON "products" ("createdAt")`);

        // Orders indexes
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_orders_userId" ON "orders" ("userId")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_orders_createdAt" ON "orders" ("createdAt")`);

        // Users index
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_users_email" ON "users" ("email")`);

        // Categories index
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_categories_name" ON "categories" ("name")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_categories_name"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_email"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_orders_createdAt"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_orders_userId"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_products_createdAt"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_products_isActive"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_products_categoryId"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_products_price"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_products_name"`);
    }

}
