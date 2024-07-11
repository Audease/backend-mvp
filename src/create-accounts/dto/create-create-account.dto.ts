import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateAccountDto {
  @ApiProperty({
    description:
      'The first name of the recruiter(or the account to be created)',
    example: 'Success',
  })
  @IsString()
  first_name: string;

  @ApiProperty({
    description: 'The last name of the recruiter(or the account to be created)',
    example: 'Abhulimen',
  })
  @IsString()
  last_name: string;

  @IsString()
  @IsOptional()
  username?: string;

  @ApiProperty({
    description:
      'The phone number of the recruiter(or the account to be created)',
    example: '+445896868',
  })
  @IsString()
  phone: string;

  @ApiProperty({
    description: 'The email of the recruiter(or the account to be created)',
    example: 'abhulimensuccess@gmail.com',
  })
  @IsString()
  email: string;

  @IsString()
  @IsOptional()
  password?: string;
}
