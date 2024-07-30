import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterSchool1722365476661 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE documents ADD COLUMN "school_id" UUID;
            ALTER TABLE documents ADD CONSTRAINT fk_school FOREIGN KEY ("school_id") REFERENCES school(id);
            `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE documents DROP CONSTRAINT fk_school;
            ALTER TABLE documents DROP COLUMN "school_id";
            `);
  }
}
