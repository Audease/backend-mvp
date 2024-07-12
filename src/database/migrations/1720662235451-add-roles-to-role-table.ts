import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRolesToRoleTable1720662235451 implements MigrationInterface {
  name = 'AddRolesToRoleTable1720662235451';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check and add 'accessor' enum value if it doesn't exist
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'roles_role_enum') THEN
          CREATE TYPE roles_role_enum AS ENUM ();
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'accessor' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'roles_role_enum')) THEN
          ALTER TYPE roles_role_enum ADD VALUE 'accessor';
        END IF;
      END
      $$;
    `);

    // Check and add 'bksd' enum value if it doesn't exist
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'bksd' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'roles_role_enum')) THEN
          ALTER TYPE roles_role_enum ADD VALUE 'bksd';
        END IF;
      END
      $$;
    `);

    // Check and add 'inductor' enum value if it doesn't exist
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'inductor' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'roles_role_enum')) THEN
          ALTER TYPE roles_role_enum ADD VALUE 'inductor';
        END IF;
      END
      $$;
    `);

    // Insert new roles into the roles table
    await queryRunner.query(`
      INSERT INTO roles (role, description) VALUES 
      ('accessor', 'Has access to action specific to accessor'),
      ('bksd', 'Has access to action specific to bksd'),
      ('inductor', 'Has access to action specific to inductor')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Delete roles from the roles table
    await queryRunner.query(`
      DELETE FROM roles WHERE role IN ('accessor', 'bksd', 'inductor')
    `);
  }
}
