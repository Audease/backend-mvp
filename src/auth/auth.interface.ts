import { RegistrationStatus } from '../utils/enum/registration_status';

export interface ISchoolCreate {
  message: string;
  keyId: string;
}

export interface IUserCreate {
  keyId: string;
  username: string;
  password: string;
}

export interface SchoolSchema {
  college_name: string;
  no_of_employee: number;
  country: string;
  business_code: string;
  address_line1: string;
  address_line2: string;
  city: string;
  post_code: string;
  state: string;
  status?: RegistrationStatus;
}

export interface UserSchema {
  first_name: string;
  last_name: string;
  username: string;
  phone: string;
  email: string;
  password: string;
  role_id: string;
}
