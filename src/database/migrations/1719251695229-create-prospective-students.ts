import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateProspectiveStudents1719251695229
  implements MigrationInterface
{
  name = 'CreateProspectiveStudents1719251695229';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'prospective_students',
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
            name: 'date_of_birth',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'mobile_number',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'NI_number',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'passport_number',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'home_address',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'funding',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'level',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'awarding',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'chosen_course',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'recruiter_id',
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
      'prospective_students',
      new TableForeignKey({
        columnNames: ['recruiter_id'],
        referencedColumnNames: ['id'],
        name: 'FK_recruiter_id_prospective_students',
        referencedTableName: 'recruiters',
        onDelete: 'CASCADE',
      })
    );

    await queryRunner.createForeignKey(
      'prospective_students',
      new TableForeignKey({
        columnNames: ['school_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'school',
        name: 'FK_school_id_prospective_students',
        onDelete: 'CASCADE',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      'prospective_students',
      'FK_recruiter_id_prospective_students'
    );
    await queryRunner.dropForeignKey(
      'prospective_students',
      'FK_school_id_prospective_students'
    );
    await queryRunner.dropTable('prospective_students');
  }
}
