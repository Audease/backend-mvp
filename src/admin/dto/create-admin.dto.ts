import { IsString } from "class-validator";
import { Role } from "../../utils/enum/role";

export class CreateAdminDto {
  @IsString()
  first_name: string;

  @IsString()
  last_name: string;

  @IsString()
  username: string;

  @IsString()
  email: string;

  @IsString()
  password: string;

  @IsString()
  role: Role.COLLEGE_ADMIN;
}