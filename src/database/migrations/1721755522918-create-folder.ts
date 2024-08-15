import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateFolder1721755522918 implements MigrationInterface {
  name = 'CreateFolder1721755522918';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'log_folders',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'userId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'log_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      })
    );

    await queryRunner.createForeignKey(
      'log_folders',
      new TableForeignKey({
        columnNames: ['log_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'app_logs',
        onDelete: 'CASCADE',
        name: 'FK_log_folders_log_id',
      })
    );

    // Create index for userId using raw SQL
    await queryRunner.query(
      `CREATE INDEX "IDX_log_folders_userId" ON "log_folders" ("userId")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('log_folders', 'FK_log_folders_log_id');
    await queryRunner.dropTable('log_folders');
  }
}
