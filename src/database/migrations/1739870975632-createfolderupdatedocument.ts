import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class Createfolderupdatedocument1739870975632
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create folders table
    await queryRunner.createTable(
      new Table({
        name: 'folders',
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
          },
          {
            name: 'userId',
            type: 'uuid',
          },
          {
            name: 'parentFolderId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true
    );

    // Add index on userId
    await queryRunner.createIndex(
      'folders',
      new TableIndex({
        name: 'IDX_FOLDERS_USER_ID',
        columnNames: ['userId'],
      })
    );

    // Add foreign key for parent folder relationship
    await queryRunner.createForeignKey(
      'folders',
      new TableForeignKey({
        name: 'FK_FOLDER_PARENT',
        columnNames: ['parentFolderId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'folders',
        onDelete: 'CASCADE',
      })
    );

    // Add foreign key for user relationship
    await queryRunner.createForeignKey(
      'folders',
      new TableForeignKey({
        name: 'FK_FOLDER_USER',
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      })
    );

    // Add folderId to documents table
    await queryRunner.query(`
            ALTER TABLE documents
            ADD COLUMN "folderId" uuid;
        `);

    // Add foreign key for folder in documents table
    await queryRunner.createForeignKey(
      'documents',
      new TableForeignKey({
        name: 'FK_DOCUMENT_FOLDER',
        columnNames: ['folderId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'folders',
        onDelete: 'SET NULL',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove foreign key from documents
    await queryRunner.dropForeignKey('documents', 'FK_DOCUMENT_FOLDER');

    // Remove folderId column from documents
    await queryRunner.query(`
            ALTER TABLE documents
            DROP COLUMN "folderId";
        `);

    // Remove foreign keys from folders
    await queryRunner.dropForeignKey('folders', 'FK_FOLDER_USER');
    await queryRunner.dropForeignKey('folders', 'FK_FOLDER_PARENT');

    // Remove index
    await queryRunner.dropIndex('folders', 'IDX_FOLDERS_USER_ID');

    // Drop folders table
    await queryRunner.dropTable('folders');
  }
}
