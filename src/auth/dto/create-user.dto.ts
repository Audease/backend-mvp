import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'The username of the contact person',
    example: 'teslim.edencollege'
  })
  @IsString()
  username: string;

  @ApiProperty({
    description: 'The password of the contact person',
    example: 'Topdevtes@123'
  })
  @IsString()
  password: string;

  @ApiProperty({
    description: 'The identifier for the school to be verified',
    example: 'ac5a5835-18b0-4bcc-8820-2861396d7e1e'
  })
  @IsString()
  keyId: string;
}
