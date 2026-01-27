import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPublicIdToProduct1769486485561 implements MigrationInterface {
    name = 'AddPublicIdToProduct1769486485561'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Add column as nullable
        await queryRunner.query(`ALTER TABLE "products" ADD "publicId" character varying`);

        // 2. Enable pgcrypto if not already enabled (for gen_random_uuid)
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

        // 3. Populate existing rows with random UUIDs
        await queryRunner.query(`UPDATE "products" SET "publicId" = gen_random_uuid()::text WHERE "publicId" IS NULL`);

        // 4. Make it NOT NULL
        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "publicId" SET NOT NULL`);

        // 5. Add constraints
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "UQ_7bbb0738c651a7109f818c1bcab" UNIQUE ("publicId")`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_7bbb0738c651a7109f818c1bca" ON "products" ("publicId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_7bbb0738c651a7109f818c1bca"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "UQ_7bbb0738c651a7109f818c1bcab"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "publicId"`);
    }

}
