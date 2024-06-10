import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './users.service';
import { v4 as uuid } from 'uuid';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Users } from './entities/user.entity';
import { Roles } from '../shared/entities/role.entity';
import { School } from '../shared/entities/school.entity';
import { UserSchema } from '../auth/auth.interface';
import { RegistrationStatus } from '../utils/enum/registration_status';
// import { CreateUserDto } from '../auth/dto/create-user.dto';
import { Role } from '../utils/enum/role';

describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<Users>;
  // let roleRepository: Repository<Roles>;
  let schoolRepository: Repository<School>;
  const uuidValue = uuid();
  const uuidValue2 = uuid();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(Users),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              where: jest.fn().mockReturnThis(),
              getOne: jest.fn(),
            })),
            where: jest.fn().mockReturnThis(),
            getOne: jest.fn().mockReturnThis(),
          },
        },
        {
          provide: getRepositoryToken(Roles),
          useValue: {
            createQueryBuilder: jest.fn(() => ({
              where: jest.fn().mockReturnThis(),
              getOne: jest.fn(),
            })),
            where: jest.fn().mockReturnThis(),
            getOne: jest.fn().mockReturnThis(),
          },
        },
        {
          provide: getRepositoryToken(School),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get(getRepositoryToken(Users));
    // roleRepository = module.get(getRepositoryToken(Roles));
    schoolRepository = module.get(getRepositoryToken(School));
  });

  describe('createUserWithCollegeId', () => {
    it('should create a user with a college ID', async () => {
      const userData: UserSchema = {
        username: 'testuser',
        password: 'password',
        email: 'test@example.com',
        phone: '1234567890',
        first_name: 'John',
        last_name: 'Doe',
        role: {
          id: '07186a09-8ced-4e6c-afca-54d226596363',
          role: Role.SCHOOL_ADMIN,
          description: 'Has full access to the school system',
          rolePermission: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
      };
      const collegeId = uuidValue;
      const school = {
        id: collegeId,
        college_name: 'Test College',
        state: 'CA',
        status: RegistrationStatus.IN_PROGRESS,
        address_line1: '123, Test Street',
        address_line2: 'Test Address Line 2',
        business_code: '123456',
        city: 'Test City',
        country: 'Nigeria',
        no_of_employee: 100,
        post_code: '12345',
      };
      const createdUser = {
        id: uuidValue2,
        username: 'testuser',
        password: 'password',
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        college_id: uuidValue2,
        phone: '1234567890',
      };

      schoolRepository.findOne = jest.fn().mockResolvedValueOnce(school);
      userRepository.create = jest.fn().mockReturnValueOnce(createdUser);
      userRepository.save = jest.fn().mockResolvedValueOnce(createdUser);

      const result = await service.createUserWithCollegeId(userData, collegeId);

      expect(schoolRepository.findOne).toHaveBeenCalledWith({
        where: { id: collegeId },
      });
      expect(userRepository.create).toHaveBeenCalledWith({
        ...userData,
        school,
      });
      expect(userRepository.save).toHaveBeenCalledWith(createdUser);
      expect(result).toEqual(createdUser);
    });
  });

  // describe('getUserByUsername', () => {
  //   it('should get a user by username', async () => {
  //     const username = 'testuser';
  //     const user = { id: 1, username: 'testuser' /* other properties */ };

  //     userRepository.createQueryBuilder = jest.fn().mockReturnValueOnce({
  //       where: jest.fn().mockReturnThis(),
  //       getOne: jest.fn().mockResolvedValueOnce(user),
  //     });

  //     const result = await service.getUserByUsername(username);


      expect(userRepository.createQueryBuilder).toHaveBeenCalled();
      expect(userRepository.createQueryBuilder().where).toHaveBeenCalledWith(
        'users.username = :username',
        { username }
      );
      expect(userRepository.createQueryBuilder().getOne).toHaveBeenCalled();
      expect(result).toEqual(user);
    });
  });


  describe('getUserRoleById', () => {
    it('should get the user role by user ID', async () => {
      const userId = '1';
      const role = {
        id: '07186a09-8ced-4e6c-afca-54d226596363',
        name: Role.SCHOOL_ADMIN,
      };
      const user = { id: userId, role /* other properties */ };

      userRepository.findOne = jest.fn().mockResolvedValueOnce(user);

      const result = await service.getUserRoleById(userId);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        relations: ['role'],
      });
      expect(result).toEqual(role);
    });
  });


  describe('getRoleById', () => {
    it('should get a role by ID', async () => {
      const roleId = '1';
      const role = { id: roleId, name: Role.SCHOOL_ADMIN };

      roleRepository.createQueryBuilder = jest.fn().mockReturnValueOnce({
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValueOnce(role),
      });

      const result = await service.getRoleById(roleId);

      expect(roleRepository.createQueryBuilder).toHaveBeenCalled();
      expect(roleRepository.createQueryBuilder().where).toHaveBeenCalledWith(
        'roles.id = :id',
        { id: roleId }
      );
      expect(roleRepository.createQueryBuilder().getOne).toHaveBeenCalled();
      expect(result).toEqual(role);
    });
  });

  describe('getRoleByName', () => {
    it('should get a role by name', async () => {
      const roleName = Role.SCHOOL_ADMIN;
      const role = { id: 1, name: roleName };

      roleRepository.createQueryBuilder = jest.fn().mockReturnValueOnce({
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValueOnce(role),
      });

      const result = await service.getRoleByName(roleName);

      expect(roleRepository.createQueryBuilder).toHaveBeenCalled();
      expect(roleRepository.createQueryBuilder().where).toHaveBeenCalledWith(
        'roles.role = :role',
        { role: roleName }
      );
      expect(roleRepository.createQueryBuilder().getOne).toHaveBeenCalled();
      expect(result).toEqual(role);
    });
  });

});
