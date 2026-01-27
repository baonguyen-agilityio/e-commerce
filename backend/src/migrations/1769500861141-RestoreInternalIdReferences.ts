import { MigrationInterface, QueryRunner, TableForeignKey, TableIndex, TableUnique } from "typeorm";

export class RestoreInternalIdReferences1769500861141 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // --- 1. PRODUCTS (categoryPublicId -> categoryId) ---
        const productsTable = await queryRunner.getTable("products");
        const hasCategoryPublicId = productsTable?.findColumnByName("categoryPublicId");

        if (hasCategoryPublicId) {
            await queryRunner.query(`ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "categoryId" integer`);
            await queryRunner.query(`
                UPDATE "products" 
                SET "categoryId" = "categories"."id" 
                FROM "categories" 
                WHERE "products"."categoryPublicId" = "categories"."publicId"
            `);

            const categoryFk = productsTable?.foreignKeys.find(fk => fk.columnNames.includes("categoryPublicId"));
            if (categoryFk) await queryRunner.dropForeignKey("products", categoryFk);
            await queryRunner.dropColumn("products", "categoryPublicId");

            await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "categoryId" SET NOT NULL`);
        }

        const updatedProductsTable = await queryRunner.getTable("products");
        if (updatedProductsTable?.findColumnByName("categoryId")) {
            const hasFk = updatedProductsTable.foreignKeys.find(fk => fk.columnNames.includes("categoryId"));
            if (!hasFk) {
                await queryRunner.createForeignKey("products", new TableForeignKey({
                    columnNames: ["categoryId"],
                    referencedColumnNames: ["id"],
                    referencedTableName: "categories",
                    onDelete: "CASCADE"
                }));
            }
            const hasIndex = updatedProductsTable.indices.find(idx => idx.name === "IDX_products_categoryId");
            if (!hasIndex) {
                await queryRunner.createIndex("products", new TableIndex({
                    name: "IDX_products_categoryId",
                    columnNames: ["categoryId"]
                }));
            }
        }

        // --- 2. ORDERS (userPublicId -> userId) ---
        const ordersTable = await queryRunner.getTable("orders");
        const hasUserPublicId = ordersTable?.findColumnByName("userPublicId");

        if (hasUserPublicId) {
            await queryRunner.query(`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "userId" integer`);
            await queryRunner.query(`
                UPDATE "orders" 
                SET "userId" = "users"."id" 
                FROM "users" 
                WHERE "orders"."userPublicId" = "users"."publicId"
            `);

            const userFk = ordersTable?.foreignKeys.find(fk => fk.columnNames.includes("userPublicId"));
            if (userFk) await queryRunner.dropForeignKey("orders", userFk);
            await queryRunner.dropColumn("orders", "userPublicId");

            await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "userId" SET NOT NULL`);
        }

        const updatedOrdersTable = await queryRunner.getTable("orders");
        if (updatedOrdersTable?.findColumnByName("userId")) {
            const hasFk = updatedOrdersTable.foreignKeys.find(fk => fk.columnNames.includes("userId"));
            if (!hasFk) {
                await queryRunner.createForeignKey("orders", new TableForeignKey({
                    columnNames: ["userId"],
                    referencedColumnNames: ["id"],
                    referencedTableName: "users",
                    onDelete: "CASCADE"
                }));
            }
            const hasIndex = updatedOrdersTable.indices.find(idx => idx.name === "IDX_orders_userId");
            if (!hasIndex) {
                await queryRunner.createIndex("orders", new TableIndex({
                    name: "IDX_orders_userId",
                    columnNames: ["userId"]
                }));
            }
        }

        // --- 3. ORDER_ITEMS (orderPublicId -> orderId, productPublicId -> productId) ---
        const orderItemsTable = await queryRunner.getTable("order_items");
        const hasOrderPublicId = orderItemsTable?.findColumnByName("orderPublicId");

        if (hasOrderPublicId) {
            await queryRunner.query(`ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "orderId" integer`);
            await queryRunner.query(`ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "productId" integer`);

            await queryRunner.query(`
                UPDATE "order_items" 
                SET "orderId" = "orders"."id" 
                FROM "orders" 
                WHERE "order_items"."orderPublicId" = "orders"."publicId"
            `);
            await queryRunner.query(`
                UPDATE "order_items" 
                SET "productId" = "products"."id" 
                FROM "products" 
                WHERE "order_items"."productPublicId" = "products"."publicId"
            `);

            // Drop unique constraint on publicIds
            const oldUnique = orderItemsTable?.uniques.find(u => u.columnNames.includes("orderPublicId"));
            if (oldUnique) await queryRunner.dropUniqueConstraint("order_items", oldUnique);

            const orderFk = orderItemsTable?.foreignKeys.find(fk => fk.columnNames.includes("orderPublicId"));
            if (orderFk) await queryRunner.dropForeignKey("order_items", orderFk);
            const prodFk = orderItemsTable?.foreignKeys.find(fk => fk.columnNames.includes("productPublicId"));
            if (prodFk) await queryRunner.dropForeignKey("order_items", prodFk);

            await queryRunner.dropColumn("order_items", "orderPublicId");
            await queryRunner.dropColumn("order_items", "productPublicId");

            await queryRunner.query(`ALTER TABLE "order_items" ALTER COLUMN "orderId" SET NOT NULL`);
            await queryRunner.query(`ALTER TABLE "order_items" ALTER COLUMN "productId" SET NOT NULL`);
        }

        const updatedOrderItemsTable = await queryRunner.getTable("order_items");
        if (updatedOrderItemsTable?.findColumnByName("orderId")) {
            const hasOrderFk = updatedOrderItemsTable.foreignKeys.find(fk => fk.columnNames.includes("orderId"));
            if (!hasOrderFk) {
                await queryRunner.createForeignKey("order_items", new TableForeignKey({
                    columnNames: ["orderId"],
                    referencedColumnNames: ["id"],
                    referencedTableName: "orders",
                    onDelete: "CASCADE"
                }));
            }
            const hasProdFk = updatedOrderItemsTable.foreignKeys.find(fk => fk.columnNames.includes("productId"));
            if (!hasProdFk) {
                await queryRunner.createForeignKey("order_items", new TableForeignKey({
                    columnNames: ["productId"],
                    referencedColumnNames: ["id"],
                    referencedTableName: "products",
                    onDelete: "CASCADE"
                }));
            }
            const hasUnique = updatedOrderItemsTable.uniques.find(u => u.name === "UQ_order_items_order_product");
            if (!hasUnique) {
                await queryRunner.createUniqueConstraint("order_items", new TableUnique({
                    name: "UQ_order_items_order_product",
                    columnNames: ["orderId", "productId"]
                }));
            }
        }

        // --- 4. CART_ITEMS (productPublicId -> productId) ---
        const cartItemsTable = await queryRunner.getTable("cart_items");
        const hasProdPublicId = cartItemsTable?.findColumnByName("productPublicId");

        if (hasProdPublicId) {
            await queryRunner.query(`ALTER TABLE "cart_items" ADD COLUMN IF NOT EXISTS "productId" integer`);
            await queryRunner.query(`
                UPDATE "cart_items" 
                SET "productId" = "products"."id" 
                FROM "products" 
                WHERE "cart_items"."productPublicId" = "products"."publicId"
            `);

            const cartItemProdFk = cartItemsTable?.foreignKeys.find(fk => fk.columnNames.includes("productPublicId"));
            if (cartItemProdFk) await queryRunner.dropForeignKey("cart_items", cartItemProdFk);

            const oldCartUnique = cartItemsTable?.uniques.find(u => u.columnNames.includes("productPublicId"));
            if (oldCartUnique) await queryRunner.dropUniqueConstraint("cart_items", oldCartUnique);

            await queryRunner.dropColumn("cart_items", "productPublicId");
            await queryRunner.query(`ALTER TABLE "cart_items" ALTER COLUMN "productId" SET NOT NULL`);
        } else {
            console.log("cart_items.productPublicId not found, skipping sync. Column productId likely already exists.");
        }

        const updatedCartItemsTable = await queryRunner.getTable("cart_items");
        const hasProdId = updatedCartItemsTable?.findColumnByName("productId");
        if (hasProdId) {
            const hasFk = updatedCartItemsTable?.foreignKeys.find(fk => fk.columnNames.includes("productId"));
            if (!hasFk) {
                await queryRunner.createForeignKey("cart_items", new TableForeignKey({
                    columnNames: ["productId"],
                    referencedColumnNames: ["id"],
                    referencedTableName: "products",
                    onDelete: "CASCADE"
                }));
            }
            const hasUnique = updatedCartItemsTable?.uniques.find(u => u.name === "UQ_cart_items_cart_product");
            if (!hasUnique) {
                await queryRunner.createUniqueConstraint("cart_items", new TableUnique({
                    name: "UQ_cart_items_cart_product",
                    columnNames: ["cartId", "productId"]
                }));
            }
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Reverse if needed
    }
}
