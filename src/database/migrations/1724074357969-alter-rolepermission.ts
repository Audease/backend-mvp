import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterRolepermission1724074357969 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE role_permission
            ADD COLUMN id uuid DEFAULT uuid_generate_v4();
        `);
    await queryRunner.query(`
            UPDATE role_permission
            SET id = uuid_generate_v4()
            WHERE id IS NULL;
        `);
    await queryRunner.query(`
            ALTER TABLE role_permission
            DROP CONSTRAINT "PK_19a94c31d4960ded0dcd0397759",
            ADD CONSTRAINT new_primary_key PRIMARY KEY (id, role_id, permission_id);
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
