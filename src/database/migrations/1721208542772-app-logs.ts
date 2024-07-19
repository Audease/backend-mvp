import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class AppLogs1721208542772 implements MigrationInterface {
  name = 'AppLogs1721208542772';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'app_logs',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'userId',
            type: 'varchar',
          },
          {
            name: 'message',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'type',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'method',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'route',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'logType',
            type: 'enum',
            enum: ['ONE_TIME', 'REUSABLE'],
            default: "'ONE_TIME'",
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],

        // Create index for userId using raw SQL
        indices: [
          {
            columnNames: ['userId'],
            isUnique: false,
            name: 'IDX_APP_LOGS_USER_ID',
            isSpatial: false,
          },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('app_logs', 'IDX_APP_LOGS_USER_ID');
    await queryRunner.dropTable('app_logs');
  }
}
