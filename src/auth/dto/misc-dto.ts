import { IsString, IsEmail } from 'class-validator';

export class verifyDto {
  @IsString()
  keyId: string;
}

export class refreshTokenDto {
  @IsString()
  refreshToken: string;
}

export class initiateResetDto {
  @IsString()
  @IsEmail()
  email: string;
}

export class resetPasswordDto {
  @IsString()
  token: string;

  @IsString()
  password: string;
}