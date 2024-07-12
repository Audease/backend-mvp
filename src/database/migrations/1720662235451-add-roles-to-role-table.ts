import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRolesToRoleTable1720662235451 implements MigrationInterface {
  name = 'AddRolesToRoleTable1720662235451';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Add new enum values
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'roles_role_enum') THEN
          CREATE TYPE roles_role_enum AS ENUM ('accessor', 'bksd', 'inductor');
        ELSE
          IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'accessor' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'roles_role_enum')) THEN
            ALTER TYPE roles_role_enum ADD VALUE 'accessor';
          END IF;
          IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'bksd' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'roles_role_enum')) THEN
            ALTER TYPE roles_role_enum ADD VALUE 'bksd';
          END IF;
          IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'inductor' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'roles_role_enum')) THEN
            ALTER TYPE roles_role_enum ADD VALUE 'inductor';
          END IF;
        END IF;
      END
      $$;
    `);

    // Commit the transaction to make the new enum values available
    await queryRunner.query('COMMIT');

    // Step 2: Add unique constraint to role column if it doesn't exist
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_constraint
          WHERE conname = 'roles_role_key' AND conrelid = 'roles'::regclass
        ) THEN
          ALTER TABLE roles ADD CONSTRAINT roles_role_key UNIQUE (role);
        END IF;
      END
      $$;
    `);

    // Step 3: Insert new roles
    await queryRunner.query(`
      INSERT INTO roles (role, description)
      VALUES 
        ('accessor', 'Has access to action specific to accessor'),
        ('bksd', 'Has access to action specific to bksd'),
        ('inductor', 'Has access to action specific to inductor')
      ON CONFLICT (role) DO NOTHING;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove the inserted roles
    await queryRunner.query(`
      DELETE FROM roles WHERE role IN ('accessor', 'bksd', 'inductor')
    `);

    // Remove the unique constraint if you want to completely reverse the migration
    await queryRunner.query(`
      ALTER TABLE roles DROP CONSTRAINT IF EXISTS roles_role_key;
    `);

    // Note: We can't easily remove enum values in PostgreSQL, so we'll leave them
  }
}
