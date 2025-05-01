import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPasswordChanged1743964322838 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "users" 
            ADD COLUMN "is_password_changed" boolean NOT NULL DEFAULT false
          `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "users" 
            DROP COLUMN "is_password_changed"
          `);
  }
}
