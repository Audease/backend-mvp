import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddApplicationStatusToProspectiveStudentsTable1720669508686
  implements MigrationInterface
{
  name = 'AddApplicationStatusToProspectiveStudentsTable1720669508686';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "prospective_students" ADD COLUMN application_mail VARCHAR(255) NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "prospective_students" ADD "application_status" character varying(50)`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "prospective_students" DROP COLUMN "application_mail`
    );
    await queryRunner.query(
      `ALTER TABLE "prospective_students" DROP COLUMN "application_status"`
    );
  }
}
