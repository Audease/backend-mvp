import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class FilterStudentsDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  funding?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  chosen_course?: string;

  @IsOptional()
  @ApiPropertyOptional()
  @Transform(({ value }) => parseInt(value, 10))
  page?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @ApiPropertyOptional()
  limit?: number ;
}
