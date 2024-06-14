import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class  CreateStudents1718303189851 implements MigrationInterface {
    name = 'CreateStudents1718303189851';

  
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
              name: 'students',
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
                    name: 'date_of_birth',
                    type: 'varchar',
                    length: '255',
                    isNullable: true,
                  },
                  {
                    name: 'address',
                    type: 'varchar',
                    length: '255',
                    isNullable: true,
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
            'students',
            new TableForeignKey({
              columnNames: ['user_id'],
              referencedColumnNames: ['id'],
              name: 'FK_user_id_students',
              referencedTableName: 'users',
              onDelete: 'CASCADE',
            })
          );
      
          await queryRunner.createForeignKey(
            'students',
            new TableForeignKey({
              columnNames: ['school_id'],
              referencedColumnNames: ['id'],
              referencedTableName: 'school',
              name: 'FK_school_id_students',
              onDelete: 'CASCADE',
            })
          );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop the foreign keys first
     const studentsTable: any = await queryRunner.getTable('students') ;
     const userForeignKey = studentsTable.foreignKeys.find(
       fk => fk.name === 'FK_user_id_students'
     );
     const schoolForeignKey =studentsTable.foreignKeys.find(
       fk => fk.name === 'FK_school_id_students'
     );
 
     if (userForeignKey) {
       await queryRunner.dropForeignKey('students', userForeignKey);
     }
     if (schoolForeignKey) {
       await queryRunner.dropForeignKey('students', schoolForeignKey);
     }
     await queryRunner.dropTable('students');
   }

}





    

