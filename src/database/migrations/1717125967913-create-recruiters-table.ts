import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateRecruitersTable1717125967913 implements MigrationInterface {
  name = 'CreateRecruitersTable1717125967913';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'recruiters',
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
            name: 'user_id',
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
      }),
    );

    await queryRunner.createForeignKey(
      'recruiters',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        name: 'FK_user_id_recruiters',
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'recruiters',
      new TableForeignKey({
        columnNames: ['school_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'school',
        name: 'FK_school_id_recruiters',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('recruiters');
    await queryRunner.dropForeignKey('users', 'FK_user_id_recruiters');
    await queryRunner.dropForeignKey('users', 'FK_school_id_recruiters');
  }
}
