import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class ArchiveStudentDto {
  @ApiProperty({
    description: 'Reason for archiving the student',
    example: 'Student requested removal from the system',
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  reason?: string;
}
