import { IsString, IsInt, IsOptional } from 'class-validator';

export class param {
  @IsString()
  id: string;
}

export class PaginationDto {
  @IsInt()
  @IsOptional()
  page?: number = 1;

  @IsInt()
  @IsOptional()
  limit?: number = 10;
}
