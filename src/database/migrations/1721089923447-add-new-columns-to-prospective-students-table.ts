import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNewColumnsToProspectiveStudentsTable1721089923447 implements MigrationInterface {
  name = 'AddNewColumnsToProspectiveStudentsTable1721089923447';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if the column 'name' exists before attempting to drop it
    const nameColumnExists = await queryRunner.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name='prospective_students' AND column_name='name'
    `);

    if (nameColumnExists.length > 0) {
      await queryRunner.query(
        `ALTER TABLE "prospective_students" DROP COLUMN "name"`
      );
    }

    // Check if the column 'first_name' exists before attempting to add it
    const firstNameColumnExists = await queryRunner.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name='prospective_students' AND column_name='first_name'
    `);

    if (firstNameColumnExists.length === 0) {
      await queryRunner.query(
        `ALTER TABLE "prospective_students" ADD COLUMN "first_name" VARCHAR(255)`
      );
    }

    // Check if the column 'last_name' exists before attempting to add it
    const lastNameColumnExists = await queryRunner.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name='prospective_students' AND column_name='last_name'
    `);

    if (lastNameColumnExists.length === 0) {
      await queryRunner.query(
        `ALTER TABLE "prospective_students" ADD COLUMN "last_name" VARCHAR(255)`
      );
    }

    // Check if the column 'middle_name' exists before attempting to add it
    const middleNameColumnExists = await queryRunner.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name='prospective_students' AND column_name='middle_name'
    `);

    if (middleNameColumnExists.length === 0) {
      await queryRunner.query(
        `ALTER TABLE "prospective_students" ADD COLUMN "middle_name" VARCHAR(255) NULL`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Check if the column 'first_name' exists before attempting to drop it
    const firstNameColumnExists = await queryRunner.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name='prospective_students' AND column_name='first_name'
    `);

    if (firstNameColumnExists.length > 0) {
      await queryRunner.query(
        `ALTER TABLE "prospective_students" DROP COLUMN "first_name"`
      );
    }

    // Check if the column 'last_name' exists before attempting to drop it
    const lastNameColumnExists = await queryRunner.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name='prospective_students' AND column_name='last_name'
    `);

    if (lastNameColumnExists.length > 0) {
      await queryRunner.query(
        `ALTER TABLE "prospective_students" DROP COLUMN "last_name"`
      );
    }

    // Check if the column 'middle_name' exists before attempting to drop it
    const middleNameColumnExists = await queryRunner.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name='prospective_students' AND column_name='middle_name'
    `);

    if (middleNameColumnExists.length > 0) {
      await queryRunner.query(
        `ALTER TABLE "prospective_students" DROP COLUMN "middle_name"`
      );
    }

    // Re-add the column 'name' if it was dropped
    const nameColumnExists = await queryRunner.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name='prospective_students' AND column_name='name'
    `);

    if (nameColumnExists.length === 0) {
      await queryRunner.query(
        `ALTER TABLE "prospective_students" ADD COLUMN "name" VARCHAR(255)`
      );
    }
  }
}
