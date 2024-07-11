import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRolesToRoleTable1720662235451 implements MigrationInterface {
  name = 'AddRolesToRoleTable1720662235451';
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "roles_role_enum" ADD VALUE 'accessor'`
    );
    await queryRunner.query(`ALTER TYPE "roles_role_enum" ADD VALUE 'bksd'`);
    await queryRunner.query(
      `ALTER TYPE "roles_role_enum" ADD VALUE 'inductor'`
    );

    await queryRunner.query(`COMMIT`);

    await queryRunner.query(`BEGIN`);
    
    await queryRunner.query(`
        INSERT INTO "roles" (role, description) VALUES 
        ('accessor', 'Has access to action specific to accessor'),
        ('bksd', 'Has access to action specific to bksd'),
        ('inductor', 'Has access to action specific to inductor')
      `);
    }
  

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DELETE FROM "roles" WHERE role IN ('accessor', 'bksd', 'inductor')
      `);
  }
}

