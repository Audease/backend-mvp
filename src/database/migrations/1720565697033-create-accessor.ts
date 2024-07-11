import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateAccessor1720565697033 implements MigrationInterface {
  name = 'CreateAccessor1720565697033';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'accessors',
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
      'accessors',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        name: 'FK_user_id_accessors',
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      })
    );

    await queryRunner.createForeignKey(
      'recruiters',
      new TableForeignKey({
        columnNames: ['school_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'school',
        name: 'FK_school_id_accessors',
        onDelete: 'CASCADE',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the foreign keys first
    const accessorsTable = await queryRunner.getTable('accessors');
    const userForeignKey = accessorsTable.foreignKeys.find(
      fk => fk.name === 'FK_user_id_accessors'
    );
    const schoolForeignKey = accessorsTable.foreignKeys.find(
      fk => fk.name === 'FK_school_id_accessors'
    );

    if (userForeignKey) {
      await queryRunner.dropForeignKey('accessors', userForeignKey);
    }
    if (schoolForeignKey) {
      await queryRunner.dropForeignKey('accessors', schoolForeignKey);
    }
    await queryRunner.dropTable('accessors');
  }
}
