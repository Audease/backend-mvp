import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class FilterStudentsDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  funding?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  chosen_course?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  search?: string;

  @IsOptional()
  @ApiPropertyOptional()
  @Transform(({ value }) => parseInt(value, 10))
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @ApiPropertyOptional()
  limit?: number = 10;

  @IsOptional()
  @IsEnum(['asc', 'desc'], {
    message: "sort must be either 'asc' or 'desc'",
  })
  @ApiPropertyOptional({
    description:
      'Sort order by creation date (asc for oldest first, desc for newest first)',
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  sort?: 'asc' | 'desc' = 'desc';
}
