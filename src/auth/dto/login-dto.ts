import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'The username of the contact person',
    example: 'teslim.edencollege',
  })
  @IsString()
  username: string;

  @ApiProperty({
    description: 'The password of the contact person',
    example: 'Topdevtes@123',
  })
  @IsString()
  password: string;
}
