import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveRecruiter1725741625243 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `
            ALTER TABLE prospective_students ADD COLUMN "user_id" UUID;
            ALTER TABLE prospective_students ADD CONSTRAINT fk_prospect_student FOREIGN KEY ("user_id") REFERENCES users(id);
            `
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
