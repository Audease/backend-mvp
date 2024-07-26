import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class FilterBksdDto {
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
  application_mail?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @ApiPropertyOptional()
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @ApiPropertyOptional()
  limit?: number = 10;
}
