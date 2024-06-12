import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateRole1716496320371 implements MigrationInterface {
  name = 'CreateRole1716496320371';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   `);
    await queryRunner.createTable(
      new Table({
        name: 'roles',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'role',
            type: 'enum',
            enum: [
              'none',
              'school_admin',
              'student',
              'external_auditor',
              'school_recruiter',
              'financial_officer',
            ],
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      })
    );

    // Insert data into the roles table
    await queryRunner.query(`
     INSERT INTO roles (role, description)
     VALUES
       ('none', 'Default role for new users'),
       ('school_admin', 'Has full access to the school system'),
       ('student', 'Has access to action specific to students'),
       ('external_auditor', 'Has access to action specific to auditors'),
       ('school_recruiter', 'Has access to action specific to the school recruiter'),
       ('financial_officer', 'Has access to action specific to the finanical officer');
   `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('roles');
  }
}
