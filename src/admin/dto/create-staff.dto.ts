import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStaffDto {
  // @ApiProperty({
  //   description:
  //     'The first name of the recruiter(or the account to be created)',
  //   example: 'Success',
  // })
  // @IsString()
  // first_name: string;

  // @ApiProperty({
  //   description: 'The last name of the recruiter(or the account to be created)',
  //   example: 'Abhulimen',
  // })
  // @IsString()
  // last_name: string;

  // @ApiProperty({
  //   description:
  //     'The phone number of the recruiter(or the account to be created)',
  //   example: '+445896868',
  // })
  // @IsString()
  // phone: string;

  @ApiProperty({
    description: 'The email of the staff to be created',
    example: '["teslimodumuyiwa@gmail.com", "odumuyiwateslim@gmail.com"]',
  })
  @IsString({ each: true })
  email: string[];
}
