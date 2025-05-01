import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUsersToExpirations1725735500115 implements MigrationInterface {
    
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE users ADD COLUMN "expiration_date" TIMESTAMP;`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE users DROP COLUMN "expiration_date";`);
  }

}
