import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNewColumnsToProspectiveStudentsTable1721089923447
  implements MigrationInterface
{
  name = 'AddNewColumnsToProspectiveStudentsTable1721089923447';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "prospective_students" DROP COLUMN "name"`
    );

    await queryRunner.query(
      `ALTER TABLE "prospective_students" ADD COLUMN "first_name" VARCHAR(255)`
    );
    await queryRunner.query(
      `ALTER TABLE "prospective_students" ADD COLUMN "last_name" VARCHAR(255)`
    );
    await queryRunner.query(
      `ALTER TABLE "prospective_students" ADD COLUMN "middle_name" VARCHAR(255) NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "prospective_students" DROP COLUMN "first_name"`
    );
    await queryRunner.query(
      `ALTER TABLE "prospective_students" DROP COLUMN "last_name"`
    );
    await queryRunner.query(
      `ALTER TABLE "prospective_students" DROP COLUMN "middle_name"`
    );

    await queryRunner.query(
      `ALTER TABLE "prospective_students" ADD COLUMN "name" VARCHAR(255)`
    );
  }
}
