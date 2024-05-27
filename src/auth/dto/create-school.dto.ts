import { IsString, IsEmail, IsNumber, IsOptional } from 'class-validator';

export class CreateSchoolDto {
  @IsString()
  college_name: string;

  @IsString()
  first_name: string;

  @IsString()
  last_name: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  phone: string;

  @IsNumber()
  no_of_employee: number;

  @IsString()
  country: string;

  @IsString()
  business_code: string;

  @IsString()
  address_line1: string;

  @IsString()
  @IsOptional()
  address_line2: string;

  @IsString()
  city: string;

  @IsString()
  post_code: string;

  @IsString()
  state: string;
}
