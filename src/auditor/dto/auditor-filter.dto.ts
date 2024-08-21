import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class FilterParam {
  @IsOptional()
  @ApiPropertyOptional()
  @IsString()
  funding: string;

  @IsOptional()
  @ApiPropertyOptional()
  @IsString()
  chosen_course: string;

  @IsOptional()
  @ApiPropertyOptional()
  course_status: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @ApiPropertyOptional()
  page?: number ;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @ApiPropertyOptional()
  limit?: number ;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Search query for filtering results',
  })
  search?: string;
}
