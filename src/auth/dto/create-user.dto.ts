import { IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  first_name: string;

  @IsString()
  last_name: string;

  @IsString()
  username: string;

  @IsString()
  phone: string;

  @IsString()
  email: string;

  @IsString()
  password: string;
}
