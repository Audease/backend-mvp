import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDefaultValuesToProspectiveStudents1720743913151
  implements MigrationInterface
{
  name = 'AddDefaultValuesToProspectiveStudents1720743913151';
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "prospective_students"
        ALTER COLUMN "application_mail" SET DEFAULT 'Not sent',
        ALTER COLUMN "application_status" SET DEFAULT 'Pending';
      `);
  }


  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "prospective_students"
        ALTER COLUMN "application_mail" DROP DEFAULT,
        ALTER COLUMN "application_status" DROP DEFAULT;
    
      `);
  }
}
