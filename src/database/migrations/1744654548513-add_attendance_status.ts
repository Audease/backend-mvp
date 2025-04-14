import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAttendanceStatus1744654548513 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'attendance_status_enum') THEN
            CREATE TYPE attendance_status_enum AS ENUM ('present', 'absent');
        END IF;
    END
$$;

-- Step 2: Add the column to the table
ALTER TABLE prospective_students
    ADD COLUMN attendance_status attendance_status_enum DEFAULT 'absent';`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
