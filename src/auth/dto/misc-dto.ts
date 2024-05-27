import { IsString } from 'class-validator';

export class verifyDto {
  @IsString()
  keyId: string;
}

export class refreshTokenDto {
  @IsString()
  refreshToken: string;
}
