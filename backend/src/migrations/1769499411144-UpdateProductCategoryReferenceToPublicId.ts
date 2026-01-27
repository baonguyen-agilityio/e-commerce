import { MigrationInterface, QueryRunner, TableForeignKey } from "typeorm";

export class UpdateProductCategoryReferenceToPublicId1769499411144 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Add categoryPublicId as nullable first
        await queryRunner.query(`ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "categoryPublicId" character varying`);

        // 2. Update categoryPublicId from categories table if categoryId exists
        const tableBeforeUpdate = await queryRunner.getTable("products");
        const hasCategoryId = tableBeforeUpdate?.findColumnByName("categoryId");
        if (hasCategoryId) {
            await queryRunner.query(`
                UPDATE "products" 
                SET "categoryPublicId" = "categories"."publicId" 
                FROM "categories" 
                WHERE "products"."categoryId" = "categories"."id"
                AND "products"."categoryPublicId" IS NULL
            `);
        }

        // 3. Get existing FK to drop it safely
        const table = await queryRunner.getTable("products");
        const oldFk = table?.foreignKeys.find(fk => fk.columnNames.includes("categoryId"));
        if (oldFk) {
            await queryRunner.dropForeignKey("products", oldFk);
        }

        // 4. Drop old column if it exists
        const hasOldColumn = table?.findColumnByName("categoryId");
        if (hasOldColumn) {
            await queryRunner.dropColumn("products", "categoryId");
        }

        // 5. Make categoryPublicId NOT NULL
        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "categoryPublicId" SET NOT NULL`);

        // 6. Add new Foreign Key safely
        const newTable = await queryRunner.getTable("products");
        const hasNewFk = newTable?.foreignKeys.find(fk => fk.columnNames.includes("categoryPublicId"));
        if (!hasNewFk) {
            await queryRunner.createForeignKey("products", new TableForeignKey({
                columnNames: ["categoryPublicId"],
                referencedColumnNames: ["publicId"],
                referencedTableName: "categories",
                onDelete: "CASCADE"
            }));
        }

        // 7. Add Index safely
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_products_categoryPublicId" ON "products" ("categoryPublicId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Reverse
        await queryRunner.query(`ALTER TABLE "products" ADD "categoryId" integer`);

        await queryRunner.query(`
            UPDATE "products" 
            SET "categoryId" = "categories"."id" 
            FROM "categories" 
            WHERE "products"."categoryPublicId" = "categories"."publicId"
        `);

        const table = await queryRunner.getTable("products");
        const foreignKey = table?.foreignKeys.find(fk => fk.columnNames.indexOf("categoryPublicId") !== -1);
        if (foreignKey) {
            await queryRunner.dropForeignKey("products", foreignKey);
        }

        await queryRunner.dropColumn("products", "categoryPublicId");
        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "categoryId" SET NOT NULL`);

        await queryRunner.createForeignKey("products", new TableForeignKey({
            columnNames: ["categoryId"],
            referencedColumnNames: ["id"],
            referencedTableName: "categories",
            onDelete: "CASCADE"
        }));

        await queryRunner.query(`CREATE INDEX "IDX_products_categoryId" ON "products" ("categoryId")`);
    }
}
