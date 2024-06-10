import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateAccountDto {
  @ApiProperty({
    description: 'The first name of the recruiter',
    example: 'Success',
  })
  @IsString()
  first_name: string;

  @ApiProperty({
    description: 'The last name of the recruiter',
    example: 'Abhulimen',
  })
  @IsString()
  last_name: string;

  @IsString()
  @IsOptional()
  username?: string;

  @ApiProperty({
    description: 'The phone number of the recruiter',
    example: '+2345896868',
  })
  @IsString()
  phone: string;

  @ApiProperty({
    description: 'The email name of the recruiter',
    example: 'abhulimensuccess@gmail.com',
  })
  @IsString()
  email: string;

  @IsString()
  @IsOptional()
  password?: string;
}
