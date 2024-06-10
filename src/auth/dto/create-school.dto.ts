import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsNumber, IsOptional } from 'class-validator';

export class CreateSchoolDto {
  @ApiProperty({
    description: 'The name of the college',
    example: 'Eden College',
  })
  @IsString()
  college_name: string;

  @ApiProperty({
    description: 'The first name of the contact person',
    example: 'Teslim',
  })
  @IsString()
  first_name: string;

  @ApiProperty({
    description: 'The last name of the contact person',
    example: 'Odumuyiwa',
  })
  @IsString()
  last_name: string;

  @ApiProperty({
    description: 'The email address of the contact person',
    example: 'teslimodumuyiwa@gmail.com',
  })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'The phone number of the contact person',
    example: '+234169462325',
  })
  @IsString()
  phone: string;

  @ApiProperty({
    description: 'The number of employees at the school',
    example: 200,
  })
  @IsNumber()
  no_of_employee: number;

  @ApiProperty({
    description: 'The country where the school is located',
    example: 'Nigeria',
  })
  @IsString()
  country: string;

  @ApiProperty({
    description: ' The business code of the school',
    example: '3992202',
  })
  @IsString()
  business_code: string;

  @ApiProperty({
    description: ' The first line of the school address.',
    example: '7, Sunday Kehinde Street',
  })
  @IsString()
  address_line1: string;

  @ApiProperty({
    description: 'The second line of the school address',
    example: 'Sagamu, Ogun State',
  })
  @IsString()
  @IsOptional()
  address_line2: string;

  @ApiProperty({
    description: 'The city where the school is located',
    example: 'Sagamu',
  })
  @IsString()
  city: string;

  @ApiProperty({
    description: 'The postal code of the school',
    example: '392892',
  })
  @IsString()
  post_code: string;

  @ApiProperty({
    description: 'The state where the school is located',
    example: 'Ogun State',
  })
  @IsString()
  county: string;

  @IsString()
  username: string;

  @IsString()
  password: string;
}
