import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  ArrayNotEmpty,
  IsArray,
} from 'class-validator';
// import { Role } from '../../utils/enum/role';
import { Type } from 'class-transformer';

export class param {
  @IsString()
  id: string;
}

export class PaginationDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
  })
  page?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  @ApiPropertyOptional({ description: 'Number of items per page', example: 10 })
  limit?: number;
}

export class EmailDto {
  @IsString()
  @ApiProperty({
    description: 'The email of the user',
    example: 'teslimodumuyiwa@gmail.com',
  })
  email: string;
}

export class AssignRoleDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @ApiProperty({
    description: 'List of staff IDs to assign the role',
    example: ['1', '2', '3'],
  })
  staffIds: string[];

  @IsString()
  @ApiProperty({
    description: 'The id of the role to assign',
    example: '1',
  })
  role: string;
}
