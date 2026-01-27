import { MigrationInterface, QueryRunner } from "typeorm";

export class AddClerkIdToCart1769497814920 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Add clerkId as nullable if it doesn't exist
        await queryRunner.query(`ALTER TABLE "carts" ADD COLUMN IF NOT EXISTS "clerkId" character varying`);

        // 2. Update clerkId from users table if userId exists
        const tableBeforeUpdate = await queryRunner.getTable("carts");
        const hasUserId = tableBeforeUpdate?.findColumnByName("userId");
        if (hasUserId) {
            await queryRunner.query(`
                UPDATE "carts" 
                SET "clerkId" = "users"."clerkId" 
                FROM "users" 
                WHERE "carts"."userId" = "users"."id"
                AND "carts"."clerkId" IS NULL
            `);
        }

        // 3. Make clerkId NOT NULL and Add Unique Constraint safely
        await queryRunner.query(`ALTER TABLE "carts" ALTER COLUMN "clerkId" SET NOT NULL`);

        const table = await queryRunner.getTable("carts");
        if (table && !table.uniques.find(u => u.name === "UQ_carts_clerkId")) {
            await queryRunner.query(`ALTER TABLE "carts" ADD CONSTRAINT "UQ_carts_clerkId" UNIQUE ("clerkId")`);
        }
        await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_carts_clerkId" ON "carts" ("clerkId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_carts_clerkId"`);
        await queryRunner.query(`ALTER TABLE "carts" DROP CONSTRAINT "UQ_carts_clerkId"`);
        await queryRunner.query(`ALTER TABLE "carts" DROP COLUMN "clerkId"`);
    }
}
