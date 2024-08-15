import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateUsers1716504816987 implements MigrationInterface {
  name = 'CreateUsers1716504816987';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'first_name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'last_name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'username',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'password',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: '2fa_required',
            type: 'boolean',
            default: false,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'phone',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'role_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'school_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            isNullable: false,
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            isNullable: false,
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      })
    );

    await queryRunner.createForeignKey(
      'users',
      new TableForeignKey({
        columnNames: ['role_id'],
        referencedColumnNames: ['id'],
        name: 'FK_role_id_users',
        referencedTableName: 'roles',
        onDelete: 'CASCADE',
      })
    );

    await queryRunner.createForeignKey(
      'users',
      new TableForeignKey({
        columnNames: ['school_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'school',
        name: 'FK_school_id_users',
        onDelete: 'CASCADE',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('users', 'FK_role_id_users');
    await queryRunner.dropForeignKey('users', 'FK_school_id_users');
    await queryRunner.dropTable('users');
  }
}
