import { MigrationInterface, QueryRunner } from 'typeorm';

export class Addarchivetoroles1745071155259 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "roles" 
            ADD COLUMN "is_archived" BOOLEAN NOT NULL DEFAULT FALSE,
            ADD COLUMN "archived_at" TIMESTAMP,
            ADD COLUMN "archived_by" VARCHAR(255),
            ADD COLUMN "archive_reason" VARCHAR(1000)
          `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "roles" 
            DROP COLUMN "is_archived",
            DROP COLUMN "archived_at",
            DROP COLUMN "archived_by",
            DROP COLUMN "archive_reason"
          `);
  }
}
