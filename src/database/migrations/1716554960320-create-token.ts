import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateToken1716554960320 implements MigrationInterface {
  name = 'CreateToken1716554960320';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'token',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['refresh', 'password_reset'],
          },
          {
            name: 'token',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'blacklisted',
            type: 'boolean',
            default: false,
          },
          {
            name: 'expires',
            type: 'timestamp with time zone',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('token');
  }
}
