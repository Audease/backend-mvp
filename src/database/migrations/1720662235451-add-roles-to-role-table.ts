import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRolesToRoleTable1720662235451 implements MigrationInterface {
  name = 'AddRolesToRoleTable1720662235451';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.startTransaction();

    try {
      // Create enum type if it doesn't exist
      await queryRunner.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'roles_role_enum') THEN
            CREATE TYPE roles_role_enum AS ENUM ('accessor', 'bksd', 'inductor');
          ELSE
            -- Add new enum values if they don't exist
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

      // Insert new roles into the roles table
      await queryRunner.query(`
        INSERT INTO roles (role, description)
        VALUES 
          ('accessor', 'Has access to action specific to accessor'),
          ('bksd', 'Has access to action specific to bksd'),
          ('inductor', 'Has access to action specific to inductor')
        ON CONFLICT (role) DO NOTHING;
      `);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.startTransaction();

    try {
      // Delete roles from the roles table
      await queryRunner.query(`
        DELETE FROM roles WHERE role IN ('accessor', 'bksd', 'inductor')
      `);

      // Remove enum values (Note: This is not directly possible in PostgreSQL,
      // you might need to recreate the type if this is crucial)
      // For now, we'll leave the enum values in place

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    }
  }
}
