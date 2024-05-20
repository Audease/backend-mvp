import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class UsersTable1716213580040 implements MigrationInterface {
    tableName = 'UsersTable1716213580040'

    public async up(queryRunner: QueryRunner): Promise<void> {

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
