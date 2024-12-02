import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateForm1732878356863 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum type for form types
    await queryRunner.query(`
            CREATE TYPE form_type_enum AS ENUM (
                'award_assessment',
                'behavioral',
                'candidate_record',
                'child_protection',
                'confidentiality',
                'data_protection',
                'employer_agreement',
                'appeal_procedure'
            )
        `);

    // Create forms table
    await queryRunner.query(`
            CREATE TABLE forms (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                type form_type_enum NOT NULL,
                title VARCHAR(255) NOT NULL,
                metadata JSONB,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);

    // Create index for forms
    await queryRunner.query(`
            CREATE INDEX idx_forms_type ON forms(type);
            CREATE INDEX idx_forms_active ON forms(is_active)
        `);

    // Create update trigger for forms
    await queryRunner.query(`
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = CURRENT_TIMESTAMP;
                RETURN NEW;
            END;
            $$ language 'plpgsql'
        `);

    await queryRunner.query(`
            CREATE TRIGGER update_forms_updated_at
                BEFORE UPDATE ON forms
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column()
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop trigger first
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS update_forms_updated_at ON forms`
    );

    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS idx_forms_active`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_forms_type`);

    // Drop table
    await queryRunner.query(`DROP TABLE IF EXISTS forms`);

    // Drop enum
    await queryRunner.query(`DROP TYPE IF EXISTS form_type_enum`);

    // Drop function
    await queryRunner.query(`DROP FUNCTION IF EXISTS update_updated_at_column`);
  }
}
