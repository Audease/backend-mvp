import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateLearnerDto {
  @ApiProperty({
    description: 'The name of the learner',
    example: 'Test Learner',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The date of birth of the learner',
    example: '1990-09-01',
  })
  @IsDateString()
  date_of_birth: string;

  @ApiProperty({
    description: 'The mobile number of the learner',
    example: '+44892928848',
  })
  @IsString()
  @IsNotEmpty()
  mobile_number: string;

  @ApiProperty({
    description: 'The email of the learner',
    example: 'testuser@example.com',
  })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'The NI number of the learner',
    example: '1239557',
  })
  @IsString()
  @IsNotEmpty()
  NI_number: string;

  @ApiProperty({
    description: 'The passport number of the learner',
    example: '1239847',
  })
  @IsString()
  @IsNotEmpty()
  passport_number: string;

  @ApiProperty({
    description: 'The home address of the learner',
    example: '24, county street, Manchester',
  })
  @IsNotEmpty()
  @IsString()
  home_address: string;

  @ApiProperty({
    description: 'funding',
    example: 'SPE',
  })
  @IsNotEmpty()
  @IsString()
  funding: string;

  @ApiProperty({
    description: 'level',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  level: number;

  @ApiProperty({
    description: 'awarding',
    example: 'Test Learner',
  })
  @IsString()
  @IsOptional()
  awarding?: string;

  @ApiProperty({
    description: 'The chosen course of the learner',
    example: 'AdultCare',
  })
  @IsNotEmpty()
  @IsString()
  chosen_course: string;
}
