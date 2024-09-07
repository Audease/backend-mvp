import { MigrationInterface, QueryRunner } from 'typeorm';

export class RolePermissionUpdate1725738837455 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        INSERT INTO permissions (name, description)
VALUES (
  'Manage Personal Profile',
  'Access to view and update personal profile, including contact details, academic records, and document uploads'
);

INSERT INTO permissions (name, description)
VALUES (
  'Assume Any Role',
  'Ability to temporarily assume permissions of any role in the system'
);

INSERT INTO permissions (name, description)
VALUES 
  ('Manage Personal Profile', 'Access to view and update personal profile, including contact details, academic records, and document uploads'),
  ('Assume Any Role', 'Ability to temporarily assume permissions of any role in the system');

INSERT INTO roles (role, description)
VALUES 
  ('laser', 'Has access to actions of a laser');

INSERT INTO role_permission (role_id, permission_id)
SELECT r.id AS role_id, p.id AS permission_id
FROM roles r
CROSS JOIN permissions p
WHERE
    (r.role = 'school_admin')
    OR (r.role = 'student' AND p.name IN ('Manage Personal Profile'))
    OR (r.role = 'external_auditor' AND p.name IN ('Audit'))
    OR (r.role = 'school_recruiter' AND p.name IN ('Add student'))
    OR (r.role = 'accessor' AND p.name IN ('Approve/reject application'))
    OR (r.role = 'inductor' AND p.name IN ('Induction'))
    OR (r.role = 'bksd' AND p.name IN ('Send Application'))
    OR (r.role = 'laser' AND p.name IN ('Learning Platform'))
    OR (r.role = 'none' AND FALSE);
            `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
