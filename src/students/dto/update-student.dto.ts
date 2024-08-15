import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class UpdateStudentDto {
  @ApiProperty({
    description: 'The first name of the student',
    example: 'John',
  })
  @IsString()
  @IsOptional()
  first_name: string;

  @ApiProperty({
    description: 'The last name of the student',
    example: 'Doe',
  })
  @IsString()
  @IsOptional()
  last_name: string;

  @ApiProperty({
    description: 'The phone number of the student',
    example: '+234567890',
  })
  @IsString()
  @IsOptional()
  mobile_number: string;

  @ApiProperty({
    description: 'The email of the student',
    example: 'johndoe@gmail.com',
  })
  @IsString()
  @IsOptional()
  email: string;

  @ApiProperty({
    description: 'The NI number of the student',
    example: 'NI123456',
  })
  @IsString()
  @IsOptional()
  NI_number: string;

  @ApiProperty({
    description: 'The passport number of the student',
    example: 'P123456',
  })
  @IsString()
  @IsOptional()
  passport_number: string;

  @ApiProperty({
    description: 'The home address of the student',
    example: '123, Main Street, Lagos',
  })
  @IsString()
  @IsOptional()
  home_address: string;

  @ApiProperty({
    description: 'The funding of the student',
    example: 'Self-funded',
  })
  @IsString()
  @IsOptional()
  funding: string;

  @ApiProperty({
    description: 'The level of the student',
    example: 100,
  })
  @IsNumber()
  @IsOptional()
  level: number;

  @ApiProperty({
    description: 'The awarding of the student',
    example: 'University of Lagos',
  })
  @IsString()
  @IsOptional()
  awarding: string;

  @ApiProperty({
    description: 'The chosen course of the student',
    example: 'Computer Science',
  })
  @IsString()
  @IsOptional()
  chosen_course: string;
}
