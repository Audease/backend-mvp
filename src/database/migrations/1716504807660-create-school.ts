import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateSchool1716504807660 implements MigrationInterface {
  name = 'CreateSchool1716504807660';
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.createTable(
      new Table({
        name: 'school',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'college_name',
            type: 'varchar',
            length: '255',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'no_of_employee',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'country',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'business_code',
            type: 'varchar',
            length: '10',
            isNullable: false,
          },
          {
            name: 'address_line1',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'address_line2',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'city',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'post_code',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'state',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['in_progress', 'verfied', 'completed'],
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.dropTable('school');
  }
}
