import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterUsers1722622075936 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE users 
ALTER COLUMN first_name DROP NOT NULL,
ALTER COLUMN last_name DROP NOT NULL,
ALTER COLUMN username DROP NOT NULL,
ALTER COLUMN email DROP NOT NULL,
ALTER COLUMN password DROP NOT NULL,
ALTER COLUMN phone DROP NOT NULL;
`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE users
ALTER COLUMN first_name SET NOT NULL,
ALTER COLUMN last_name SET NOT NULL,
ALTER COLUMN username SET NOT NULL,
ALTER COLUMN email SET NOT NULL,
ALTER COLUMN password SET NOT NULL,
ALTER COLUMN phone SET NOT NULL,
`);
  }
}
