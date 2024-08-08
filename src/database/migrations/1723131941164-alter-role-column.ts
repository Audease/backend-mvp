import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterRoleColumn1723131941164 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
            ALTER TABLE roles ADD COLUMN role_string VARCHAR(255);
            UPDATE roles SET role_string = role;
            ALTER TABLE roles DROP COLUMN role;
            ALTER TABLE roles RENAME COLUMN role_string TO role; 
            `
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
