import { IsOptional, IsString, IsDateString, IsEmail } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateLearnerDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  name?: string;

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional()
  date_of_birth?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  mobile_number?: string;

  @IsOptional()
  @IsEmail()
  @ApiPropertyOptional()
  email?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  NI_number?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  passport_number?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  home_address?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  funding?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  awarding?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  chosen_course?: string;
}
