import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateFormSubmission1733920928278 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE form_submissions 
            DROP CONSTRAINT IF EXISTS form_submissions_student_id_fkey
        `);

    await queryRunner.query(`
            ALTER TABLE form_submissions
            ADD CONSTRAINT form_submissions_student_id_fkey
            FOREIGN KEY (student_id) 
            REFERENCES prospective_students(id)
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE form_submissions 
        DROP CONSTRAINT IF EXISTS form_submissions_student_id_fkey
    `);

    await queryRunner.query(`
        ALTER TABLE form_submissions
        ADD CONSTRAINT form_submissions_student_id_fkey
        FOREIGN KEY (student_id) 
        REFERENCES users(id)
    `);
  }
}
