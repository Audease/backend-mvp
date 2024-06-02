import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateAccountDto {
  @IsString()
  first_name: string;

  @IsString()
  last_name: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  phone: string;

  @IsString()
  email: string;

  @IsString()
  @IsOptional()
  password?: string;
}
