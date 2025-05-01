import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateWorkflow1725969249352 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
            CREATE TABLE workflows (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name VARCHAR NOT NULL,
            description TEXT,
            onboarding_status VARCHAR CHECK (onboarding_status IN ('pending', 'completed')) DEFAULT 'pending',
            school_id UUID,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
            FOREIGN KEY (school_id) REFERENCES school(id)
            );
            `
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('workflows', 'workflows_school_id_fkey');
    await queryRunner.query(`DROP TABLE workflows`);
  }
}
