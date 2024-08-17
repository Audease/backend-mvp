import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNewColumnsToStudents1723757768121
  implements MigrationInterface
{
  name = 'AddNewColumnsToStudents1723757768121';
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "students" ADD "course_status" varchar(255)  DEFAULT 'Not completed'`
    );

    await queryRunner.query(
      `ALTER TABLE "students" ADD "application_status" varchar(255) DEFAULT 'Pending'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "students" DROP COLUMN "course_status"`
    );
    await queryRunner.query(
      `ALTER TABLE "students" DROP COLUMN "application_status"`
    );
  }
}
