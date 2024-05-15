import { IsString } from "class-validator";
import { Role } from "../../utils/enum/role";

export class CreateUserDto {
  @IsString()
  first_name: string;

  @IsString()
  last_name: string;

  @IsString()
  username: string;

  @IsString()
  phone: string

  @IsString()
  email: string;

  @IsString()
  password: string;

  @IsString()
  role: Role;
}