import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsPositive, IsString } from "class-validator";

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
  @IsPositive()
  @ApiPropertyOptional()
  page?: number = 1;

  @IsOptional()
  @IsPositive()
  @ApiPropertyOptional()
  limit?: number = 10;
  

}
