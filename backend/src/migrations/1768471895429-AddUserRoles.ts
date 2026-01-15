import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserRoles1768471895429 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE users_role_enum ADD VALUE IF NOT EXISTS 'staff';`,
    );
    await queryRunner.query(
      `ALTER TYPE users_role_enum ADD VALUE IF NOT EXISTS 'super_admin';`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log("Cannot remove enum values in PostgreSQL");
  }
}
