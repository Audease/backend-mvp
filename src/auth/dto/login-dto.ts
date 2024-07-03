import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

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

  @ApiProperty({
    description: 'The device token of the contact person',
    example: 'iuytredr6789i8uygtfre456',
  })
  @IsOptional()
  @IsString()
  deviceToken: string;
}
