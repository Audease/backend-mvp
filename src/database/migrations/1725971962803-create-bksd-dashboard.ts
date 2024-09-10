import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBksdDashboard1725971962803 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE bksd_dashboard (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            first_name VARCHAR(255) NOT NULL,
            last_name VARCHAR(255) NOT NULL,
            middle_name VARCHAR(255),
            date_of_birth DATE NOT NULL,
            mobile_number VARCHAR(255),
            email VARCHAR(255),
            NI_number VARCHAR(255),
            passport_number VARCHAR(255),
            home_address VARCHAR(255),
            funding VARCHAR(255),
            level INTEGER,
            awarding VARCHAR(255),
            chosen_course VARCHAR(255),
            application_mail VARCHAR(255) DEFAULT 'Sent',
            school_id UUID,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
            updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
            application_status application_status_enum DEFAULT 'Pending',
            FOREIGN KEY (school_id) REFERENCES school(id)
);

            `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE bksd_dashboard`);
  }
}
