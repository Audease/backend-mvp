import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

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

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Filter by certificate status',
    example: 'Approved',
  })
  certificate_status?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Filter by course status',
    example: 'Completed',
  })
  course_status?: string;

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
}
