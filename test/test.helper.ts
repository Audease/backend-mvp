import { faker } from '@faker-js/faker';
import { School } from '../src/shared/entities/school.entity';
import { Users } from '../src/users/entities/user.entity';
import { Role } from '../src/utils/enum/role';
import { RegistrationStatus } from '../src/utils/enum/registration_status';

export const getFakeUser = (): Users => {
  return {
    id: faker.string.uuid(),
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    username: faker.internet.userName(),
    email: faker.internet.email(),
    password: faker.lorem.word(),
    phone: faker.phone.number(),
    role: Role.SCHOOL_ADMIN,
    created_at: faker.date.past(),
    updated_at: faker.date.recent(),
    school: getFakeSchool(),
  };
};

export const getFakeSchool = (): School => {
  return {
    id: faker.string.uuid(),
    name: faker.company.name(),
    no_of_employee: faker.number.int({ min: 1, max: 1000 }),
    country: faker.location.country(),
    business_code: faker.number.int({ min: 1000, max: 9999 }).toString(),
    address_line1: faker.location.street(),
    address_line2: faker.location.street(),
    city: faker.location.city(),
    post_code: faker.location.zipCode(),
    state: faker.location.state(),
    status: faker.helpers.arrayElement([
      RegistrationStatus.IN_PROGRESS,
      RegistrationStatus.COMPLETED,
    ]),
    users: getFakeUser(),
    created_at: faker.date.past(),
    updated_at: faker.date.recent(),
  };
};
