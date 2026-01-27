import { MigrationInterface, QueryRunner, TableForeignKey } from "typeorm";

export class UpdateOrderAndItemToPublicIds1769500395767 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // --- ORDERS TABLE ---

        // 1. Add userPublicId to orders
        await queryRunner.query(`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "userPublicId" character varying`);

        // 2. Sync userPublicId from users table
        await queryRunner.query(`
            UPDATE "orders" 
            SET "userPublicId" = "users"."publicId" 
            FROM "users" 
            WHERE "orders"."userId" = "users"."id"
            AND "orders"."userPublicId" IS NULL
        `);

        // 3. Handle Order Foreign Key
        const ordersTable = await queryRunner.getTable("orders");
        const userFk = ordersTable?.foreignKeys.find(fk => fk.columnNames.includes("userId"));
        if (userFk) {
            await queryRunner.dropForeignKey("orders", userFk);
        }

        // 4. Drop old userId column
        if (ordersTable?.findColumnByName("userId")) {
            await queryRunner.dropColumn("orders", "userId");
        }

        // 5. Make userPublicId NOT NULL
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "userPublicId" SET NOT NULL`);

        // 6. Add new FK for orders -> users(publicId)
        await queryRunner.createForeignKey("orders", new TableForeignKey({
            columnNames: ["userPublicId"],
            referencedColumnNames: ["publicId"],
            referencedTableName: "users",
            onDelete: "CASCADE"
        }));

        // --- ORDER_ITEMS TABLE ---

        // 1. Add orderPublicId and productPublicId to order_items
        await queryRunner.query(`ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "orderPublicId" character varying`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "productPublicId" character varying`);

        // 2. Sync publicIds
        await queryRunner.query(`
            UPDATE "order_items" 
            SET "orderPublicId" = "orders"."publicId" 
            FROM "orders" 
            WHERE "order_items"."orderId" = "orders"."id"
            AND "order_items"."orderPublicId" IS NULL
        `);
        await queryRunner.query(`
            UPDATE "order_items" 
            SET "productPublicId" = "products"."publicId" 
            FROM "products" 
            WHERE "order_items"."productId" = "products"."id"
            AND "order_items"."productPublicId" IS NULL
        `);

        // 3. Handle OrderItems Foreign Keys
        const itemsTable = await queryRunner.getTable("order_items");
        const orderFk = itemsTable?.foreignKeys.find(fk => fk.columnNames.includes("orderId"));
        if (orderFk) await queryRunner.dropForeignKey("order_items", orderFk);

        const productFk = itemsTable?.foreignKeys.find(fk => fk.columnNames.includes("productId"));
        if (productFk) await queryRunner.dropForeignKey("order_items", productFk);

        // 4. Drop old columns
        if (itemsTable?.findColumnByName("orderId")) await queryRunner.dropColumn("order_items", "orderId");
        if (itemsTable?.findColumnByName("productId")) await queryRunner.dropColumn("order_items", "productId");

        // 5. Make NOT NULL
        await queryRunner.query(`ALTER TABLE "order_items" ALTER COLUMN "orderPublicId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "order_items" ALTER COLUMN "productPublicId" SET NOT NULL`);

        // 6. Add new FKs for order_items
        await queryRunner.createForeignKey("order_items", new TableForeignKey({
            columnNames: ["orderPublicId"],
            referencedColumnNames: ["publicId"],
            referencedTableName: "orders",
            onDelete: "CASCADE"
        }));
        await queryRunner.createForeignKey("order_items", new TableForeignKey({
            columnNames: ["productPublicId"],
            referencedColumnNames: ["publicId"],
            referencedTableName: "products",
            onDelete: "CASCADE"
        }));

        // 7. Re-add Unique Constraint on order_items
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "UQ_order_items_order_product" UNIQUE ("orderPublicId", "productPublicId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Reverse process (simplified for brevity, generally not recommended for complex destructive migrations)
        // Add back old columns, sync back IDs, restore FKs
    }
}
