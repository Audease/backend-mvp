import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';

export class StudentFilterDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Filter by funding source',
    example: 'SPE',
  })
  funding?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Filter by chosen course',
    example: 'AdultCare',
  })
  chosen_course?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Filter by application status',
    example: 'Approved',
  })
  application_status?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Filter by mail status',
    example: 'Sent',
  })
  application_mail?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Filter by inductor status',
    example: 'Sent',
  })
  inductor_status?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Filter by lazer status',
    example: 'Approved',
  })
  lazer_status?: string;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @ApiPropertyOptional({
    description: 'Page number (starts from 1)',
    example: 1,
  })
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(100)
  @ApiPropertyOptional({
    description: 'Number of items per page (max 100)',
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
}
