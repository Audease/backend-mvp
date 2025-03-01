import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsUUID } from 'class-validator';

export class AddDocumentsToStudentDto {
  @ApiProperty({
    description: 'Array of document IDs to assign to the student',
    example: [
      '123e4567-e89b-12d3-a456-426614174000',
      '123e4567-e89b-12d3-a456-426614174001',
    ],
    type: [String],
  })
  @IsArray()
  @IsNotEmpty()
  @IsUUID(4, { each: true })
  documentIds: string[];

  @ApiProperty({
    description: 'Student ID to assign the documents',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String,
  })
  @IsNotEmpty()
  studentId: string;
}
