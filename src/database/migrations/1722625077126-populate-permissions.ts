import { MigrationInterface, QueryRunner } from 'typeorm';

export class PopulatePermissions1722625077126 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            INSERT INTO permissions (name, description)
VALUES 
('Add student', 'Permission to create new students'),
('Add staff', 'Permission to add new staff'),
('Send invite', 'Permission to send invite'),
('Approve/reject application', 'Permission to reject or approve application'),
('Send Application', 'Permission to send application');
            
            `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DELETE FROM permissions;
    `);
  }
}
