import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

// Improved FilterDto for BKSD
export class FilterDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Filter students by funding type',
    example: 'SPE',
  })
  funding?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Filter students by chosen course',
    example: 'AdultCare',
  })
  chosen_course?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    enum: ['Sent', 'Not sent'],
    description: 'Filter students by application mail status',
    example: 'Sent',
  })
  application_mail?: string;

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
    example: 'John Doe',
  })
  search?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Filter students by certification status',
    example: 'Approved',
  })
  certificate_status?: string;
}
