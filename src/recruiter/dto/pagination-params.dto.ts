import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class PaginationParamsDto {
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
  })
  page?: number = 1; // Default to 1 if not provided

  @IsOptional()
  @ApiPropertyOptional({ description: 'Number of items per page', example: 10 })
  limit?: number = 10; // Default to 10 if not provided

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Search query for filtering results',
  })
  search?: string;
}
