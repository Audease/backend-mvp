import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class FilterDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Filter students by funding type',
    example: 'SPE',
  })
  funding?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Filter students by chosen course',
    example: 'AdultCare',
  })
  chosen_course?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Filter students by application status',
    example: 'Approved',
  })
  application_status?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @ApiPropertyOptional()
  page?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @ApiPropertyOptional()
  limit?: number;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Search query for filtering results',
  })
  search?: string;
}
