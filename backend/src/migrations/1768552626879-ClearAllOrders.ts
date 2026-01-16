import { MigrationInterface, QueryRunner } from "typeorm";

export class ClearAllOrders1768552626879 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM order_items`);
        await queryRunner.query(`DELETE FROM orders`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        console.log("Cannot restore deleted orders");
    }

}
