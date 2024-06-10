import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateRolepermission1716497279846 implements MigrationInterface {
  name = 'CreateRolepermission1716497279846';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'role_permission',
        columns: [
          {
            name: 'role_id',
            type: 'uuid',
            isPrimary: true,
          },
          {
            name: 'permission_id',
            type: 'uuid',
            isPrimary: true,
          },
        ],
        foreignKeys: [
          {
            columnNames: ['role_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'roles',
            onDelete: 'CASCADE',
            name: 'fk_role_permission_role',
          },
          {
            columnNames: ['permission_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'permissions',
            onDelete: 'CASCADE',
            name: 'fk_role_permission_permission',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      'role_permission',
      'fk_role_permission_role',
    );
    await queryRunner.dropForeignKey(
      'role_permission',
      'fk_role_permission_permission',
    );
    await queryRunner.dropTable('role_permission');
  }
}
