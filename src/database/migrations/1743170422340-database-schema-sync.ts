import { MigrationInterface, QueryRunner } from 'typeorm';

export class DatabaseSchemaSync1743170422340 implements MigrationInterface {
  name = 'DatabaseSchemaSync1743170422340';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add missing inductor_status column to prospective_students table
    await queryRunner.query(`
          ALTER TABLE prospective_students
          ADD COLUMN IF NOT EXISTS inductor_status VARCHAR(255) DEFAULT 'Not sent'
        `);

    // Add missing certificate_status column to prospective_students table
    await queryRunner.query(`
          ALTER TABLE prospective_students
          ADD COLUMN IF NOT EXISTS certificate_status VARCHAR(255) DEFAULT 'Pending'
        `);

    // Add missing lazer_status column to prospective_students table
    await queryRunner.query(`
          ALTER TABLE prospective_students
          ADD COLUMN IF NOT EXISTS lazer_status VARCHAR(255) DEFAULT 'Pending'
        `);

    // Add missing workflow_id to roles table
    await queryRunner.query(`
          ALTER TABLE roles
          ADD COLUMN IF NOT EXISTS workflow_id UUID REFERENCES workflows(id)
        `);

    // Add missing role_id to workflows table
    await queryRunner.query(`
          ALTER TABLE workflows
          ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES roles(id)
        `);

    // Add missing is_submitted column to form_submissions table
    await queryRunner.query(`
          ALTER TABLE form_submissions
          ADD COLUMN IF NOT EXISTS is_submitted BOOLEAN DEFAULT false
        `);

    // Add missing studentId column to documents table
    await queryRunner.query(`
          ALTER TABLE documents
          ADD COLUMN IF NOT EXISTS "studentId" UUID,
          ADD COLUMN IF NOT EXISTS studentid UUID REFERENCES prospective_students(id) ON UPDATE CASCADE ON DELETE SET NULL
        `);

    // Create index for student documents
    await queryRunner.query(`
          CREATE INDEX IF NOT EXISTS idx_document_student_id ON documents (studentid)
        `);

    // Add missing publicUrl column to documents table (replacing cloudinaryUrl if needed)
    await queryRunner.query(`
          ALTER TABLE documents
          ADD COLUMN IF NOT EXISTS "publicUrl" VARCHAR
        `);

    // Fix any missing constraints in role_permission table
    await queryRunner.query(`
        ALTER TABLE role_permission
        DROP CONSTRAINT IF EXISTS "PK_19a94c31d4960ded0dcd0397759"
      `);

    await queryRunner.query(`
        ALTER TABLE role_permission
        ADD COLUMN IF NOT EXISTS id UUID DEFAULT uuid_generate_v4()
      `);

    // Check if constraint exists before adding it
    await queryRunner.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint 
            WHERE conname = 'new_primary_key' 
            AND conrelid = 'role_permission'::regclass
          ) THEN
            ALTER TABLE role_permission
            ADD CONSTRAINT new_primary_key PRIMARY KEY (id, role_id, permission_id);
          END IF;
        END $$;
      `);

    // Create dashboard tables if they don't exist
    await queryRunner.query(`
          CREATE TABLE IF NOT EXISTS accessor_dashboard (
            id UUID DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
            first_name VARCHAR(255) NOT NULL,
            last_name VARCHAR(255) NOT NULL,
            middle_name VARCHAR(255),
            date_of_birth DATE NOT NULL,
            mobile_number VARCHAR(255),
            email VARCHAR(255),
            ni_number VARCHAR(255),
            passport_number VARCHAR(255),
            home_address VARCHAR(255),
            funding VARCHAR(255),
            level INTEGER,
            awarding VARCHAR(255),
            chosen_course VARCHAR(255),
            application_mail VARCHAR(255) DEFAULT 'Not sent',
            school_id UUID REFERENCES school,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
            updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
            application_status application_status_enum DEFAULT 'Pending'
          )
        `);

    await queryRunner.query(`
          CREATE TABLE IF NOT EXISTS bksd_dashboard (
            id UUID DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
            first_name VARCHAR(255) NOT NULL,
            last_name VARCHAR(255) NOT NULL,
            middle_name VARCHAR(255),
            date_of_birth DATE NOT NULL,
            mobile_number VARCHAR(255),
            email VARCHAR(255),
            ni_number VARCHAR(255),
            passport_number VARCHAR(255),
            home_address VARCHAR(255),
            funding VARCHAR(255),
            level INTEGER,
            awarding VARCHAR(255),
            chosen_course VARCHAR(255),
            application_mail VARCHAR(255) DEFAULT 'Sent',
            school_id UUID REFERENCES school,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
            updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
            application_status application_status_enum DEFAULT 'Pending'
          )
        `);

    await queryRunner.query(`
          CREATE TABLE IF NOT EXISTS inductor_dashboard (
            id UUID DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
            first_name VARCHAR(255) NOT NULL,
            last_name VARCHAR(255) NOT NULL,
            middle_name VARCHAR(255),
            date_of_birth DATE NOT NULL,
            mobile_number VARCHAR(255),
            email VARCHAR(255),
            ni_number VARCHAR(255),
            passport_number VARCHAR(255),
            home_address VARCHAR(255),
            funding VARCHAR(255),
            level INTEGER,
            awarding VARCHAR(255),
            chosen_course VARCHAR(255),
            application_mail VARCHAR(255) DEFAULT 'Sent',
            school_id UUID REFERENCES school,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
            updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
            application_status application_status_enum DEFAULT 'Pending'
          )
        `);

    // Update name column in students table if missing
    await queryRunner.query(`
          ALTER TABLE students
          ADD COLUMN IF NOT EXISTS name VARCHAR NOT NULL
        `);

    // Update folder-related tables
    await queryRunner.query(`
          CREATE TABLE IF NOT EXISTS folders (
            id UUID DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
            name VARCHAR NOT NULL,
            "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            "parentFolderId" UUID REFERENCES folders(id) ON DELETE CASCADE,
            "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);

    await queryRunner.query(`
          CREATE INDEX IF NOT EXISTS "IDX_FOLDERS_USER_ID" ON folders ("userId")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Note: Down migrations are risky on a production system
    // Consider whether you want to actually implement these

    // Drop dashboard tables
    await queryRunner.query(`DROP TABLE IF EXISTS accessor_dashboard`);
    await queryRunner.query(`DROP TABLE IF EXISTS bksd_dashboard`);
    await queryRunner.query(`DROP TABLE IF EXISTS inductor_dashboard`);

    // Remove columns from prospective_students
    await queryRunner.query(`
          ALTER TABLE prospective_students 
          DROP COLUMN IF EXISTS inductor_status,
          DROP COLUMN IF EXISTS certificate_status,
          DROP COLUMN IF EXISTS lazer_status
        `);

    // Remove workflow_id from roles
    await queryRunner.query(`
          ALTER TABLE roles
          DROP COLUMN IF EXISTS workflow_id
        `);

    // Remove role_id from workflows
    await queryRunner.query(`
          ALTER TABLE workflows
          DROP COLUMN IF EXISTS role_id
        `);

    // Remove is_submitted from form_submissions
    await queryRunner.query(`
          ALTER TABLE form_submissions
          DROP COLUMN IF EXISTS is_submitted
        `);

    // Drop index and remove columns from documents
    await queryRunner.query(`DROP INDEX IF EXISTS idx_document_student_id`);
    await queryRunner.query(`
          ALTER TABLE documents
          DROP COLUMN IF EXISTS "studentId",
          DROP COLUMN IF EXISTS studentid,
          DROP COLUMN IF EXISTS "publicUrl"
        `);

    // Revert changes to role_permission
    await queryRunner.query(`
          ALTER TABLE role_permission
          DROP CONSTRAINT IF EXISTS new_primary_key;
          
          ALTER TABLE role_permission
          DROP COLUMN IF EXISTS id;
          
          ALTER TABLE role_permission
          ADD CONSTRAINT "PK_19a94c31d4960ded0dcd0397759" PRIMARY KEY (role_id, permission_id)
        `);

    // Drop folders table
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_FOLDERS_USER_ID"`);
    await queryRunner.query(`DROP TABLE IF EXISTS folders`);
  }
}
