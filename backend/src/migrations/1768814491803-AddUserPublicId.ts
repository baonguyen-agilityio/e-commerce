import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserPublicId1737XXXXXXXXX implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasColumn = await queryRunner.hasColumn("users", "publicId");
    
    if (!hasColumn) {
      await queryRunner.query(
        `ALTER TABLE "users" ADD COLUMN "publicId" VARCHAR(255);`
      );
    }

    await queryRunner.query(
      `UPDATE "users" SET "publicId" = "clerkId" WHERE "publicId" IS NULL;`
    );

    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "publicId" SET NOT NULL;`
    );

    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "UQ_users_publicId" UNIQUE ("publicId");`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "UQ_users_publicId";`
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "publicId";`
    );
  }
}