import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddExpirationDateToUsers1723585283223
  implements MigrationInterface
{
  name = 'AddExpirationDateToUsers1723585283223 ';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "expirationDate" TIMESTAMP`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "expirationDate"`);
  }
}
