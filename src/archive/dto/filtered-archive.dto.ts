// src/archive/dto/filter-archived.dto.ts

import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterArchivedDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
  })
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
  })
  limit?: number = 10;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Search query for filtering results',
    example: 'John',
  })
  search?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  @ApiPropertyOptional({
    description: 'Filter by archive date from',
    example: '2023-01-01',
  })
  from_date?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  @ApiPropertyOptional({
    description: 'Filter by archive date to',
    example: '2023-12-31',
  })
  to_date?: Date;
}
