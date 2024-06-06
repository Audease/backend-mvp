import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail } from 'class-validator';

export class verifyDto {
  @ApiProperty({
    description: 'The identifier for the school to be verified',
    example: 'ac5a5835-18b0-4bcc-8820-2861396d7e1e',
  })
  @IsString()
  keyId: string;
}

export class refreshTokenDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0ODc3M2E3Zi0zM',
  })
  @IsString()
  refreshToken: string;
}

export class initiateResetDto {
  @ApiProperty({
    example: 'teslim@gmail.com',
  })
  @IsString()
  @IsEmail()
  email: string;
}

export class resetPasswordDto {
  @ApiProperty({
    example: 'da6d95818e2b2a1c9d24a1440899fc3f12a7ca794e789b6e6d246f752e55',
  })
  @IsString()
  token: string;

  @ApiProperty({
    example: 'Topdevtes@987',
  })
  @IsString()
  password: string;
}
