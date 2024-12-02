import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFormSubmission1732878364801 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum for submission status
    await queryRunner.query(`
            CREATE TYPE submission_status_enum AS ENUM (
                'draft',
                'submitted',
                'under_review',
                'approved',
                'rejected'
            )
        `);

    // Create form_submissions table
    await queryRunner.query(`
            CREATE TABLE form_submissions (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                form_id UUID REFERENCES forms(id),
                status submission_status_enum DEFAULT 'draft',
                data JSONB NOT NULL,
                student_id UUID REFERENCES users(id),
                reviewer_id UUID REFERENCES users(id),
                review_comment TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);

    // Create indexes for form_submissions
    await queryRunner.query(`
            CREATE INDEX idx_form_submissions_student ON form_submissions(student_id);
            CREATE INDEX idx_form_submissions_reviewer ON form_submissions(reviewer_id);
            CREATE INDEX idx_form_submissions_status ON form_submissions(status)
        `);

    // Create trigger for form_submissions
    await queryRunner.query(`
            CREATE TRIGGER update_form_submissions_updated_at
                BEFORE UPDATE ON form_submissions
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column()
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop trigger first
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS update_form_submissions_updated_at ON form_submissions`
    );

    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS idx_form_submissions_status`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_form_submissions_reviewer`
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_form_submissions_student`
    );

    // Drop table
    await queryRunner.query(`DROP TABLE IF EXISTS form_submissions`);

    // Drop enum
    await queryRunner.query(`DROP TYPE IF EXISTS submission_status_enum`);
  }
}
