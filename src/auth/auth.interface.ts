import { RegistrationStatus } from '../utils/enum/registration_status';

export interface ISchoolCreate {
  message: string;
  keyId: string;
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
