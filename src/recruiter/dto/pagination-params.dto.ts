import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsPositive, IsString } from 'class-validator';

export class PaginationParamsDto {
  @IsOptional()
  @IsPositive()
  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
  })
  page?: number = 1;

  @IsOptional()
  @IsPositive()
  @ApiPropertyOptional({ description: 'Number of items per page', example: 10 })
  limit?: number = 10;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Search query for filtering results',
    example: 10,
  })
  search?: string;
}
