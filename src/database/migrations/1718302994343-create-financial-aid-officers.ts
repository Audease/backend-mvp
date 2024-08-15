import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateFinancialAidOfficers1718302994343
  implements MigrationInterface
{
  name = 'CreateFinancialAidOfficers1718302994343';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'financial_aid_officers',
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
      })
    );

    await queryRunner.createForeignKey(
      'financial_aid_officers',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        name: 'FK_user_id_financial_aid_officers',
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      })
    );

    await queryRunner.createForeignKey(
      'financial_aid_officers',
      new TableForeignKey({
        columnNames: ['school_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'school',
        name: 'FK_school_id_financial_aid_officers',
        onDelete: 'CASCADE',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the foreign keys first
    const financialAidOfficersTable: any = await queryRunner.getTable(
      'financial_aid_officers'
    );
    const userForeignKey = financialAidOfficersTable.foreignKeys.find(
      fk => fk.name === 'FK_user_id_financial_aid_officers'
    );
    const schoolForeignKey = financialAidOfficersTable.foreignKeys.find(
      fk => fk.name === 'FK_school_id_financial_aid_officers'
    );

    if (userForeignKey) {
      await queryRunner.dropForeignKey(
        'financial_aid_officers',
        userForeignKey
      );
    }
    if (schoolForeignKey) {
      await queryRunner.dropForeignKey(
        'financial_aid_officers',
        schoolForeignKey
      );
    }
    await queryRunner.dropTable('financial_aid_officers');
  }
}
