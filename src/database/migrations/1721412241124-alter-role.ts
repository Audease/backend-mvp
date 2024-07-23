import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterRole1721412241124 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE roles ADD COLUMN "school_id" UUID;
      ALTER TABLE roles ADD CONSTRAINT fk_school FOREIGN KEY ("school_id") REFERENCES school(id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE roles DROP CONSTRAINT fk_school;
      ALTER TABLE roles DROP COLUMN "school_id";
    `);
  }
}
