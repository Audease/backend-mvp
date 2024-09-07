import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStatusColumn1725736079263 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `
            ALTER TABLE roles
            ADD COLUMN onboarding_status VARCHAR(255) NOT NULL CHECK (onboarding_status IN ('pending', 'completed')) DEFAULT 'pending';

            ALTER TABLE staff
            ADD COLUMN onboarding_status VARCHAR(255) NOT NULL CHECK (onboarding_status IN ('pending', 'completed')) DEFAULT 'pending';


            ALTER TABLE prospective_students
            ADD COLUMN onboarding_status VARCHAR(255) NOT NULL CHECK (onboarding_status IN ('pending', 'completed')) DEFAULT 'pending';
              `
        )

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
