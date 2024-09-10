import { IsArray, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWorflowDto {
  @ApiProperty({
    description: 'The name of the workflow',
    example: 'Recruitment',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'The role of the workflow',
    example: '["Admin", "Staff"]',
  })
  @IsArray()
  role: string[];
}
