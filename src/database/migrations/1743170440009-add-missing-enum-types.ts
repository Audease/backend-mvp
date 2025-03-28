import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMissingEnumTypes1743170440009 implements MigrationInterface {
  name = 'AddMissingEnumTypes1743170440009';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create application_status_enum if it doesn't exist
    await queryRunner.query(`
          DO $$
          BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'application_status_enum') THEN
              CREATE TYPE application_status_enum AS ENUM ('Pending', 'Approved', 'Rejected');
            END IF;
          END
          $$;
        `);

    // Create staff_status_enum if it doesn't exist
    await queryRunner.query(`
          DO $$
          BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'staff_status_enum') THEN
              CREATE TYPE staff_status_enum AS ENUM ('assigned', 'unassigned');
            END IF;
          END
          $$;
        `);

    // Create school_status_enum if it doesn't exist
    await queryRunner.query(`
          DO $$
          BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'school_status_enum') THEN
              CREATE TYPE school_status_enum AS ENUM ('in_progress', 'verfied', 'completed');
            END IF;
          END
          $$;
        `);

    // Create onboarding_status_enum if it doesn't exist
    await queryRunner.query(`
          DO $$
          BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'onboarding_status_enum') THEN
              CREATE TYPE onboarding_status_enum AS ENUM ('pending', 'completed');
            END IF;
          END
          $$;
        `);

    // Create app_logs_logtype_enum if it doesn't exist
    await queryRunner.query(`
          DO $$
          BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_logs_logtype_enum') THEN
              CREATE TYPE app_logs_logtype_enum AS ENUM ('ONE_TIME', 'REUSABLE');
            END IF;
          END
          $$;
        `);

    // Create form_type_enum if it doesn't exist
    await queryRunner.query(`
          DO $$
          BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'form_type_enum') THEN
              CREATE TYPE form_type_enum AS ENUM (
                'award_assessment',
                'behavioral',
                'candidate_record',
                'child_protection',
                'confidentiality',
                'data_protection',
                'employer_agreement',
                'appeal_procedure',
                'equal_opportunities',
                'extremism_policy',
                'guidance_policy',
                'health_and_safety',
                'privacy_notice',
                'participant_agreement',
                'skills_assessment',
                'complaint'
              );
            END IF;
          END
          $$;
        `);

    // Create submission_status_enum if it doesn't exist
    await queryRunner.query(`
          DO $$
          BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'submission_status_enum') THEN
              CREATE TYPE submission_status_enum AS ENUM (
                'draft',
                'submitted',
                'under_review',
                'approved',
                'rejected'
              );
            END IF;
          END
          $$;
        `);

    // Create token_type_enum if it doesn't exist
    await queryRunner.query(`
          DO $$
          BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'token_type_enum') THEN
              CREATE TYPE token_type_enum AS ENUM ('access', 'refresh', 'reset_password');
            END IF;
          END
          $$;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
