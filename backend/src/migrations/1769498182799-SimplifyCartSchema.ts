import { MigrationInterface, QueryRunner, TableForeignKey } from "typeorm";

export class SimplifyCartSchema1769498182799 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Get the table to find existing foreign keys
        const table = await queryRunner.getTable("carts");
        const foreignKey = table?.foreignKeys.find(
            (fk) => fk.columnNames.indexOf("userId") !== -1,
        );

        // 2. Drop the old foreign key if it exists
        if (foreignKey) {
            await queryRunner.dropForeignKey("carts", foreignKey);
        }

        // 3. Drop the redundant userId column if it exists
        if (table?.findColumnByName("userId")) {
            await queryRunner.dropColumn("carts", "userId");
        }

        // 4. Add new Foreign Key linking clerkId to User.clerkId safely
        const updatedTable = await queryRunner.getTable("carts");
        const hasNewFk = updatedTable?.foreignKeys.find(fk => fk.columnNames.includes("clerkId"));
        if (!hasNewFk) {
            await queryRunner.createForeignKey(
                "carts",
                new TableForeignKey({
                    columnNames: ["clerkId"],
                    referencedColumnNames: ["clerkId"],
                    referencedTableName: "users",
                    onDelete: "CASCADE",
                }),
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Reverse logic
        await queryRunner.query(`ALTER TABLE "carts" ADD "userId" integer`);

        // We would need to populate userId back from users table before adding FK
        await queryRunner.query(`
        UPDATE "carts" 
        SET "userId" = "users"."id" 
        FROM "users" 
        WHERE "carts"."clerkId" = "users"."clerkId"
    `);

        await queryRunner.createForeignKey(
            "carts",
            new TableForeignKey({
                columnNames: ["userId"],
                referencedColumnNames: ["id"],
                referencedTableName: "users",
                onDelete: "CASCADE",
            }),
        );
    }
}
