import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsUUID } from 'class-validator';

export class AssignDocumentToStudentsDto {
  @ApiProperty({
    description: 'Document ID to assign to multiple students',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String,
  })
  @IsNotEmpty()
  @IsUUID(4)
  documentId: string;

  @ApiProperty({
    description: 'Array of student IDs to assign the document to',
    example: [
      '123e4567-e89b-12d3-a456-426614174000',
      '123e4567-e89b-12d3-a456-426614174001',
    ],
    type: [String],
  })
  @IsArray()
  @IsNotEmpty()
  @IsUUID(4, { each: true })
  studentIds: string[];
}
