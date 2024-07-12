import { RolesBuilder } from 'nest-access-control';
import { Role } from './utils/enum/role';

export const roles: RolesBuilder = new RolesBuilder();

roles
  .grant(Role.SCHOOL_ADMIN)
  .readOwn('create-accounts')
  .createOwn('create-accounts')
  .updateOwn('create-accounts')
  .deleteOwn('create-accounts');

roles
  .grant(Role.SCHOOL_RECRUITER)
  .readOwn('create-recruiter')
  .createOwn('create-recruiter')
  .updateOwn('create-recruiter')
  .deleteOwn('create-recruiter');
