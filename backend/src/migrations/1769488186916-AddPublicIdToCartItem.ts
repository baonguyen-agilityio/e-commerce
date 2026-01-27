import { MigrationInterface, QueryRunner, TableColumn, TableIndex } from "typeorm";

export class AddPublicIdToCartItem1769488186916 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Add publicId column as nullable first if it doesn't exist
        const table = await queryRunner.getTable("cart_items");
        const hasColumn = table?.findColumnByName("publicId");

        if (!hasColumn) {
            await queryRunner.addColumn(
                "cart_items",
                new TableColumn({
                    name: "publicId",
                    type: "varchar",
                    isNullable: true,
                }),
            );

            // 2. Populate existing rows with random UUIDs using Postgres md5/random as a fallback
            await queryRunner.query(
                `UPDATE cart_items SET "publicId" = md5(random()::text || clock_timestamp()::text)::uuid WHERE "publicId" IS NULL;`,
            );

            // 3. Make the column non-nullable and unique
            await queryRunner.changeColumn(
                "cart_items",
                "publicId",
                new TableColumn({
                    name: "publicId",
                    type: "varchar",
                    isNullable: false,
                    isUnique: true,
                }),
            );
        }

        // 4. Add index if it doesn't exist
        const hasIndex = table?.indices.find(idx => idx.name === "IDX_CART_ITEMS_PUBLIC_ID");
        if (!hasIndex) {
            await queryRunner.createIndex(
                "cart_items",
                new TableIndex({
                    name: "IDX_CART_ITEMS_PUBLIC_ID",
                    columnNames: ["publicId"],
                    isUnique: true,
                }),
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropIndex("cart_items", "IDX_CART_ITEMS_PUBLIC_ID");
        await queryRunner.dropColumn("cart_items", "publicId");
    }
}
