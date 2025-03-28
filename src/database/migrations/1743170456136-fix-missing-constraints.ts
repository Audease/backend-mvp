import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixMissingConstraints1743170456136 implements MigrationInterface {
  name = 'FixMissingConstraints1743170456136';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Fix any missing foreign key in accessors table
    await queryRunner.query(`
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM pg_constraint WHERE conname = 'FK_school_id_accessors'
            ) THEN
              ALTER TABLE accessors
              ADD CONSTRAINT "FK_school_id_accessors" FOREIGN KEY (school_id) 
              REFERENCES school(id) ON DELETE CASCADE;
            END IF;
          END
          $$;
        `);

    // Fix documents table foreign key to student
    await queryRunner.query(`
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM pg_constraint WHERE conname = 'fk_document_student'
            ) THEN
              ALTER TABLE documents
              ADD CONSTRAINT fk_document_student FOREIGN KEY (studentid)
              REFERENCES prospective_students(id) ON UPDATE CASCADE ON DELETE SET NULL;
            END IF;
          END
          $$;
        `);

    // Fix document folder foreign key
    await queryRunner.query(`
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM pg_constraint WHERE conname = 'FK_DOCUMENT_FOLDER'
            ) THEN
              ALTER TABLE documents
              ADD CONSTRAINT "FK_DOCUMENT_FOLDER" FOREIGN KEY ("folderId")
              REFERENCES folders(id) ON DELETE SET NULL;
            END IF;
          END
          $$;
        `);

    // Fix folder parent foreign key
    await queryRunner.query(`
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM pg_constraint WHERE conname = 'FK_FOLDER_PARENT'
            ) THEN
              ALTER TABLE folders
              ADD CONSTRAINT "FK_FOLDER_PARENT" FOREIGN KEY ("parentFolderId")
              REFERENCES folders(id) ON DELETE CASCADE;
            END IF;
          END
          $$;
        `);

    // Fix folder user foreign key
    await queryRunner.query(`
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM pg_constraint WHERE conname = 'FK_FOLDER_USER'
            ) THEN
              ALTER TABLE folders
              ADD CONSTRAINT "FK_FOLDER_USER" FOREIGN KEY ("userId")
              REFERENCES users(id) ON DELETE CASCADE;
            END IF;
          END
          $$;
        `);

    // Add check constraints for onboarding_status columns
    await queryRunner.query(`
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM pg_constraint WHERE conname = 'prospective_students_onboarding_status_check'
            ) THEN
              ALTER TABLE prospective_students
              ADD CONSTRAINT prospective_students_onboarding_status_check
              CHECK ((onboarding_status)::text = ANY ((ARRAY ['pending'::character varying, 'completed'::character varying])::text[]));
            END IF;
          END
          $$;
        `);

    await queryRunner.query(`
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM pg_constraint WHERE conname = 'staff_onboarding_status_check'
            ) THEN
              ALTER TABLE staff
              ADD CONSTRAINT staff_onboarding_status_check
              CHECK ((onboarding_status)::text = ANY ((ARRAY ['pending'::character varying, 'completed'::character varying])::text[]));
            END IF;
          END
          $$;
        `);

    await queryRunner.query(`
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM pg_constraint WHERE conname = 'roles_onboarding_status_check'
            ) THEN
              ALTER TABLE roles
              ADD CONSTRAINT roles_onboarding_status_check
              CHECK ((onboarding_status)::text = ANY ((ARRAY ['pending'::character varying, 'completed'::character varying])::text[]));
            END IF;
          END
          $$;
        `);

    await queryRunner.query(`
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM pg_constraint WHERE conname = 'workflows_onboarding_status_check'
            ) THEN
              ALTER TABLE workflows
              ADD CONSTRAINT workflows_onboarding_status_check
              CHECK ((onboarding_status)::text = ANY ((ARRAY ['pending'::character varying, 'completed'::character varying])::text[]));
            END IF;
          END
          $$;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
