import { MigrationInterface, QueryRunner } from 'typeorm';

export class PopulatePermissions1722625077126 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            INSERT INTO permissions (name, description)
VALUES 
('create_user', 'Permission to create new users'),
('update_user', 'Permission to update user information'),
('delete_user', 'Permission to delete users'),
('read_roles', 'Permission to view roles'),
('assign_role', 'Permission to assign roles to users');
            
            `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DELETE FROM permissions
            WHERE name IN ('create_user', 'update_user', 'delete_user', 'read_roles', 'assign_role');
            `);
  }
}
