import { Test, TestingModule } from '@nestjs/testing';
import { v4 as uuid } from 'uuid';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { JwtAuthService } from './jwt.service';
import { RedisService } from '../shared/services/redis.service';
import { MailService } from '../shared/services/mail.service';
import { UserService } from '../users/users.service';
import { NotFoundException } from '@nestjs/common';
// import { CreateSchoolDto } from './dto/create-school.dto';
// import { Role } from '../utils/enum/role';
import * as bcrypt from 'bcrypt';
import { DbTransactionFactory } from '../shared/services/transactions/TransactionManager';
// import { SchoolSchema } from './auth.interface';

describe('AuthService', () => {
  let service: AuthService;
  // let authRepository: AuthRepository;
  let jwtService: JwtAuthService;
  let redisService: RedisService;
  let mailService: MailService;
  let userService: UserService;
  // const uuidValue = uuid();
  // const uuidValue2 = uuid();
  const uuidValue3 = uuid();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: AuthRepository,
          useValue: {
            findSchool: jest.fn(),
            create: jest.fn(),
            updateStatus: jest.fn(),
          },
        },
        {
          provide: JwtAuthService,
          useValue: {
            generateAuthTokens: jest.fn(),
            verifyRefreshToken: jest.fn(),
            generateAccessToken: jest.fn(),
          },
        },
        {
          provide: RedisService,
          useValue: {
            getClient: jest.fn().mockReturnValue({
              hset: jest.fn(),
              hget: jest.fn(),
              hdel: jest.fn(),
              set: jest.fn(),
              get: jest.fn(),
              del: jest.fn(),
            }),
          },
        },
        {
          provide: MailService,
          useValue: {
            sendTemplateMail: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            getRoleByName: jest.fn(),
            getUserByUsername: jest.fn().mockResolvedValue({
              id: uuidValue3,
              username: 'testuser',
              password: await bcrypt.hash('password', 10),
            }),
            createUserWithCollegeId: jest.fn(),
            getUserRoleById: jest.fn().mockReturnValue({
              id: '07186a09-8ced-4e6c-afca-54d226596363',
            }),
            findOne: jest.fn(),
            getUserByEmail: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: DbTransactionFactory,
          useValue: {
            createTransaction: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    // authRepository = module.get<AuthRepository>(AuthRepository);
    jwtService = module.get<JwtAuthService>(JwtAuthService);
    redisService = module.get<RedisService>(RedisService);
    mailService = module.get<MailService>(MailService);
    userService = module.get<UserService>(UserService);
  });

  // describe('createSchool', () => {
  //   it('should create a school if it does not already exist', async () => {
  //     const createSchoolDto: CreateSchoolDto = {
  //       college_name: 'Test College',
  //       first_name: 'John',
  //       last_name: 'Doe',
  //       email: 'teslimodumuyiwa@gmail.com',
  //       phone: '+2347031234567',
  //       no_of_employee: 100,
  //       country: 'Nigeria',
  //       business_code: '123456',
  //       address_line1: '123, Test Street',
  //       address_line2: 'Test Address Line 2',
  //       city: 'Test City',
  //       post_code: '12345',
  //       county: 'Test State',
  //     };
  //     const schoolData = {
  //       id: uuidValue,
  //       college_name: 'Test College',
  //       state: 'CA',
  //       status: RegistrationStatus.IN_PROGRESS,
  //       address_line1: '123, Test Street',
  //       address_line2: 'Test Address Line 2',
  //       business_code: '123456',
  //       city: 'Test City',
  //       country: 'Nigeria',
  //       no_of_employee: 100,
  //       post_code: '12345',
  //     };

  //     authRepository.findSchool = jest.fn().mockResolvedValueOnce(null);
  //     authRepository.create = jest.fn().mockResolvedValueOnce(schoolData);
  //     redisService.getClient = jest.fn().mockReturnValue({
  //       hset: jest.fn(),
  //     });
  //     mailService.sendTemplateMail = jest.fn().mockResolvedValueOnce({});

  //     const result = await service.createSchool(createSchoolDto);

  //     expect(authRepository.findSchool).toHaveBeenCalledWith(
  //       createSchoolDto.college_name,
  //     );
  //     expect(authRepository.create).toHaveBeenCalledWith({
  //       college_name: createSchoolDto.college_name,
  //       state: createSchoolDto.county,
  //       address_line1: createSchoolDto.address_line1,
  //       address_line2: createSchoolDto.address_line2,
  //       business_code: createSchoolDto.business_code,
  //       city: createSchoolDto.city,
  //       country: createSchoolDto.country,
  //       no_of_employee: createSchoolDto.no_of_employee,
  //       post_code: createSchoolDto.post_code,
  //       status: RegistrationStatus.IN_PROGRESS,
  //     });
  //     expect(redisService.getClient().hset).toHaveBeenCalled();
  //     expect(mailService.sendTemplateMail).toHaveBeenCalled();
  //     expect(result).toHaveProperty('message');
  //     expect(result).toHaveProperty('keyId');
  //   });

  //   it('should throw ConflictException if the school already exists', async () => {
  //     const createSchoolDto: CreateSchoolDto = {
  //       college_name: 'Test College',
  //       first_name: 'John',
  //       last_name: 'Doe',
  //       email: 'teslimodumuyiwa@gmail.com',
  //       phone: '+2347031234567',
  //       no_of_employee: 100,
  //       country: 'Nigeria',
  //       business_code: '123456',
  //       address_line1: '123, Test Street',
  //       address_line2: 'Test Address Line 2',
  //       city: 'Test City',
  //       post_code: '12345',
  //       county: 'Test State',
  //     };
  //     const existingSchool = {
  //       id: uuidValue,
  //       college_name: 'Test College',
  //     };

  //     authRepository.findSchool = jest
  //       .fn()
  //       .mockResolvedValueOnce(existingSchool);

  //     await expect(service.createSchool(createSchoolDto)).rejects.toThrow(
  //       ConflictException,
  //     );
  //   });
  // });

  // describe('login', () => {
  //   it('should return a token if the credentials are valid and 2FA is not required', async () => {
  //     const loginData = {
  //       username: 'testuser',
  //       password: 'password',
  //       deviceToken: 'test-device-token',
  //     };
  //     const userData = {
  //       id: 'user-id',
  //       username: 'testuser',
  //       password: await bcrypt.hash('password', 10),
  //       '2fa_required': false,
  //     };
  //     const roleData = {
  //       id: 'role-id',
  //       name: 'SCHOOL_ADMIN',
  //     };
  //     const token = 'test-token';

  //     userService.getUserByUsername = jest.fn().mockResolvedValueOnce(userData);
  //     userService.getUserRoleById = jest.fn().mockResolvedValueOnce(roleData);
  //     jwtService.generateAuthTokens = jest.fn().mockResolvedValueOnce(token);

  //     const result = await service.login(loginData);

  //     expect(userService.getUserByUsername).toHaveBeenCalledWith(
  //       loginData.username
  //     );
  //     expect(userService.getUserRoleById).toHaveBeenCalledWith(userData.id);
  //     expect(jwtService.generateAuthTokens).toHaveBeenCalledWith(
  //       userData.id,
  //       roleData.id
  //     );
  //     expect(result).toEqual({ token });
  //   });

  //   it('should return a token if 2FA is required and device token is valid', async () => {
  //     const loginData = {
  //       username: 'testuser',
  //       password: 'password',
  //       deviceToken: 'valid-device-token',
  //     };
  //     const userData = {
  //       id: 'user-id',
  //       username: 'testuser',
  //       password: await bcrypt.hash('password', 10),
  //       '2fa_required': true,
  //     };
  //     const roleData = {
  //       id: 'role-id',
  //       name: 'SCHOOL_ADMIN',
  //     };
  //     const token = 'test-token';

  //     userService.getUserByUsername = jest.fn().mockResolvedValueOnce(userData);
  //     userService.getUserRoleById = jest.fn().mockResolvedValueOnce(roleData);
  //     jwtService.generateAuthTokens = jest.fn().mockResolvedValueOnce(token);
  //     redisService.getClient().get = jest.fn().mockResolvedValueOnce('true');

  //     const result = await service.login(loginData);

  //     expect(userService.getUserByUsername).toHaveBeenCalledWith(
  //       loginData.username
  //     );
  //     expect(redisService.getClient().get).toHaveBeenCalledWith(
  //       `device_token:${userData.id}:${loginData.deviceToken}`
  //     );
  //     expect(userService.getUserRoleById).toHaveBeenCalledWith(userData.id);
  //     expect(jwtService.generateAuthTokens).toHaveBeenCalledWith(
  //       userData.id,
  //       roleData.id
  //     );
  //     expect(result).toEqual({ token });
  //   });

  //   it('should throw NotFoundException if the username is invalid', async () => {
  //     const loginData = {
  //       username: 'invaliduser',
  //       password: 'password',
  //       deviceToken: 'test-device-token',
  //     };

  //     userService.getUserByUsername = jest.fn().mockResolvedValueOnce(null);

  //     await expect(service.login(loginData)).rejects.toThrow(NotFoundException);
  //     await expect(service.login(loginData)).rejects.toThrow(
  //       'Invalid username or password'
  //     );
  //   });

  //   it('should throw NotFoundException if the password is invalid', async () => {
  //     const loginData = {
  //       username: 'testuser',
  //       password: 'wrongpassword',
  //       deviceToken: 'test-device-token',
  //     };
  //     const userData = {
  //       id: 'user-id',
  //       username: 'testuser',
  //       password: await bcrypt.hash('password', 10),
  //     };

  //     userService.getUserByUsername = jest.fn().mockResolvedValueOnce(userData);

  //     await expect(service.login(loginData)).rejects.toThrow(NotFoundException);
  //     await expect(service.login(loginData)).rejects.toThrow(
  //       'Invalid username or password'
  //     );
  //   });

  //   it('should throw NotFoundException if the user has no password', async () => {
  //     const loginData = {
  //       username: 'testuser',
  //       password: 'password',
  //       deviceToken: 'test-device-token',
  //     };
  //     const userData = {
  //       id: 'user-id',
  //       username: 'testuser',
  //       password: null,
  //     };

  //     userService.getUserByUsername = jest.fn().mockResolvedValueOnce(userData);

  //     await expect(service.login(loginData)).rejects.toThrow(NotFoundException);
  //     await expect(service.login(loginData)).rejects.toThrow(
  //       'Invalid username or password'
  //     );
  //   });

  //   it('should throw NotFoundException if the user has no id', async () => {
  //     const loginData = {
  //       username: 'testuser',
  //       password: 'password',
  //       deviceToken: 'test-device-token',
  //     };
  //     const userData = {
  //       username: 'testuser',
  //       password: await bcrypt.hash('password', 10),
  //     };

  //     userService.getUserByUsername = jest.fn().mockResolvedValueOnce(userData);

  //     await expect(service.login(loginData)).rejects.toThrow(NotFoundException);
  //     await expect(service.login(loginData)).rejects.toThrow('Invalid user');
  //   });

  //   // it('should throw ForbiddenException if 2FA is required and no device token is provided', async () => {
  //   //   const loginData = {
  //   //     username: 'testuser',
  //   //     password: 'password',
  //   //   };
  //   //   const userData = {
  //   //     id: 'user-id',
  //   //     username: 'testuser',
  //   //     password: await bcrypt.hash('password', 10),
  //   //     '2fa_required': true,
  //   //   };

  //   //   userService.getUserByUsername = jest.fn().mockResolvedValueOnce(userData);

  //   //   await expect(service.login(loginData)).rejects.toThrow(
  //   //     'Invalid username or password'
  //   //   );
  //   // });

  //   // it('should throw NotFoundException if 2FA is required and device token is invalid', async () => {
  //   //   const loginData = {
  //   //     username: 'testuser',
  //   //     password: 'password',
  //   //     deviceToken: 'invalid-device-token',
  //   //   };
  //   //   const userData = {
  //   //     id: 'user-id',
  //   //     username: 'testuser',
  //   //     password: await bcrypt.hash('password', 10),
  //   //     '2fa_required': true,
  //   //   };

  //   //   userService.getUserByUsername = jest.fn().mockResolvedValueOnce(userData);
  //   //   redisService.getClient().get = jest.fn().mockResolvedValueOnce(null);

  //   //   await expect(service.login(loginData)).rejects.toThrow(NotFoundException);
  //   //   await expect(service.login(loginData)).rejects.toThrow(
  //   //     'Invalid device token'
  //   //   );
  //   // });
  // });
  describe('refreshToken', () => {
    it('should generate a new access token', async () => {
      const refreshToken = 'someRefreshToken';
      const userId = uuidValue3;
      const roleId = '07186a09-8ced-4e6c-afca-54d226596363';
      const newAccessToken = 'newAccessToken';

      jwtService.verifyRefreshToken = jest
        .fn()
        .mockResolvedValueOnce({ sub: userId });
      userService.findOne = jest.fn().mockResolvedValueOnce({ id: userId });
      userService.getUserRoleById = jest
        .fn()
        .mockResolvedValueOnce({ id: roleId });
      jwtService.generateAccessToken = jest
        .fn()
        .mockResolvedValueOnce(newAccessToken);

      const result = await service.refreshToken(refreshToken);

      expect(jwtService.verifyRefreshToken).toHaveBeenCalledWith(refreshToken);
      expect(userService.findOne).toHaveBeenCalledWith(userId);
      expect(userService.getUserRoleById).toHaveBeenCalledWith(userId);
      expect(jwtService.generateAccessToken).toHaveBeenCalledWith(
        userId,
        roleId
      );
      expect(result).toEqual({ token: newAccessToken });
    });

    it('should throw NotFoundException if the user is invalid', async () => {
      const refreshToken = 'someRefreshToken';
      const userId = 1;

      jwtService.verifyRefreshToken = jest
        .fn()
        .mockResolvedValueOnce({ sub: userId });
      userService.findOne = jest.fn().mockResolvedValueOnce(null);

      await expect(service.refreshToken(refreshToken)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('initiatePasswordReset', () => {
    it('should initiate password reset and send an email', async () => {
      const email = 'test@example.com';
      const userId = uuidValue3;
      // const resetKey = 'someResetKey';

      userService.getUserByEmail = jest
        .fn()
        .mockResolvedValueOnce({ id: userId });
      redisService.getClient = jest.fn().mockReturnValue({
        set: jest.fn(),
      });
      mailService.sendTemplateMail = jest.fn().mockResolvedValueOnce({});

      const result = await service.initiatePasswordReset(email);

      expect(userService.getUserByEmail).toHaveBeenCalledWith(email);
      expect(redisService.getClient().set).toHaveBeenCalledWith(
        expect.any(String),
        userId,
        'EX',
        86400
      );
      expect(mailService.sendTemplateMail).toHaveBeenCalled();
      expect(result).toEqual({
        message:
          'Password reset initiated check your mail for further instructions',
      });
    });

    it('should throw NotFoundException if the email is invalid', async () => {
      const email = 'invalid@example.com';

      userService.getUserByEmail = jest.fn().mockResolvedValueOnce(null);

      await expect(service.initiatePasswordReset(email)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('resetPassword', () => {
    it('should reset the password and remove the token from Redis', async () => {
      const data = {
        token: 'someToken',
        password: 'newPassword',
      };
      const userId = 1;
      // const hashedPassword = await bcrypt.hash(data.password, 10);

      redisService.getClient = jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValueOnce(userId),
        del: jest.fn(),
      });
      userService.findOne = jest.fn().mockResolvedValueOnce({ id: userId });
      userService.update = jest.fn().mockResolvedValueOnce({ id: userId });

      const result = await service.resetPassword(data);

      expect(redisService.getClient().get).toHaveBeenCalledWith(data.token);
      expect(userService.findOne).toHaveBeenCalledWith(userId);
      expect(userService.update).toHaveBeenCalledWith(userId, {
        password: expect.any(String),
      });
      expect(redisService.getClient().del).toHaveBeenCalledWith(data.token);
      expect(result).toEqual({ message: 'Password reset successfully' });
    });

    it('should throw NotFoundException if the token is invalid', async () => {
      const data = {
        token: 'invalidToken',
        password: 'newPassword',
      };

      redisService.getClient = jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValueOnce(null),
      });

      await expect(service.resetPassword(data)).rejects.toThrow(
        NotFoundException
      );
    });

    it('should throw NotFoundException if the user is invalid', async () => {
      const data = {
        token: 'someToken',
        password: 'newPassword',
      };
      const userId = 1;

      redisService.getClient = jest.fn().mockReturnValueOnce({
        get: jest.fn().mockResolvedValueOnce(userId),
      });
      userService.findOne = jest.fn().mockResolvedValueOnce(null);

      await expect(service.resetPassword(data)).rejects.toThrow(
        NotFoundException
      );
    });
  });
});
