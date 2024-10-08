import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
// import { LoginDto } from './dto/login-dto';
import { AuthRepository } from './auth.repository';
import { JwtAuthService } from './jwt.service';
import { RedisService } from '../shared/services/redis.service';
import { MailService } from '../shared/services/mail.service';
import { UserService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { initiateResetDto } from './dto/misc-dto';
import { resetPasswordDto } from './dto/misc-dto';
// import { TokenResponse } from '../utils/interface/token.interface';
import { NotFoundException } from '@nestjs/common';
import { DbTransactionFactory } from '../shared/services/transactions/TransactionManager';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  const uuidValue3 = uuid();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
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

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  // describe('login', () => {
  //   it('should call authService.login and return the result', async () => {
  //     const loginDto: LoginDto = {
  //       username: 'teslim.edencollege.admin',
  //       password: 'password1234',
  //     };
  //     const expectedResult: { token: TokenResponse } = {
  //       token: {
  //         access: {
  //           token: 'access-token',
  //           expires: new Date(),
  //         },
  //         refresh: {
  //           token: 'refresh-token',
  //           expires: new Date(),
  //         },
  //       },
  //     };

  //     jest.spyOn(authService, 'login').mockResolvedValue(expectedResult);

  //     const result = await controller.login(loginDto);

  //     expect(authService.login).toHaveBeenCalledWith(loginDto);
  //     expect(result).toEqual(expectedResult);
  //   });

  //   it('should throw UnauthorizedException if authService.login throws an error', async () => {
  //     const loginDto: LoginDto = {
  //       username: 'teslim.edencollege.admin',
  //       password: 'password12344',
  //     };
  //     const error = new Error('Login failed');

  //     jest.spyOn(authService, 'login').mockRejectedValue(error);

  //     await expect(controller.login(loginDto)).rejects.toThrow(
  //       UnauthorizedException
  //     );
  //     expect(authService.login).toHaveBeenCalledWith(loginDto);
  //   });
  // });

  // describe('createSchool', () => {
  //   it('should call authService.createSchool and return the result', async () => {
  //     const createSchoolDto: CreateSchoolDto = {
  //       college_name: 'Eden College',
  //       no_of_employee: 10,
  //       email: 'teslimodumuyiwa@gmail.com',
  //       first_name: 'Teslim',
  //       last_name: 'Odumuyiwa',
  //       phone: '08012345678',
  //       country: 'Nigeria',
  //       business_code: '123456',
  //       address_line1: '123, Eden College Street',
  //       address_line2: 'Eden College',
  //       city: 'Lagos',
  //       post_code: '100001',
  //       county: 'Lagos',
  //     };

  //     const expectedResult = {
  //       message: 'School created successfully',
  //     };

  //     jest
  //       .spyOn(authService, 'createSchool')
  //       .mockResolvedValue(expectedResult as never);

  //     const result = await controller.createSchool(createSchoolDto);

  //     expect(authService.createSchool).toHaveBeenCalledWith(createSchoolDto);
  //     expect(result).toEqual(expectedResult);
  //   });

  //   it('should throw InternalServerErrorException if authService.createSchool throws an error', async () => {
  //     const createSchoolDto: CreateSchoolDto = {
  //       college_name: 'Eden College',
  //       email: 'teslimodumuyiwa@gmail.com',
  //       first_name: 'Teslim',
  //       last_name: 'Odumuyiwa',
  //       phone: '08012345678',
  //       no_of_employee: 10,
  //       country: 'Nigeria',
  //       business_code: '123456',
  //       address_line1: '123, Eden College Street',
  //       address_line2: 'Eden College',
  //       city: 'Lagos',
  //       post_code: '100001',
  //       county: 'Lagos',
  //     };

  //     const error = new Error('School creation failed');

  //     jest.spyOn(authService, 'createSchool').mockRejectedValue(error);

  //     await expect(controller.createSchool(createSchoolDto)).rejects.toThrow(
  //       HttpException,
  //     );
  //     expect(authService.createSchool).toHaveBeenCalledWith(createSchoolDto);
  //   });
  // });

  describe('initiateReset', () => {
    it('should call authService.initiateReset and return the result', async () => {
      const initiateResetDto: initiateResetDto = {
        email: 'teslimodumuyiwa@gmail.com',
      };

      const expectedResult = {
        message: 'Password reset initiated successfully',
      };

      jest
        .spyOn(authService, 'initiatePasswordReset')
        .mockResolvedValue(expectedResult as never);

      const result = await controller.initiateReset(initiateResetDto);

      expect(authService.initiatePasswordReset).toHaveBeenCalledWith(
        initiateResetDto.email
      );

      expect(result).toEqual(expectedResult);
    });

    it('should throw NotFoundException if authService.initiateReset throws an error', async () => {
      const initiateResetDto: initiateResetDto = {
        email: 'teslimodumuyiwa@gmail.com',
      };

      const error = new Error('Password reset initiation failed');

      jest.spyOn(authService, 'initiatePasswordReset').mockRejectedValue(error);

      await expect(controller.initiateReset(initiateResetDto)).rejects.toThrow(
        NotFoundException
      );

      expect(authService.initiatePasswordReset).toHaveBeenCalledWith(
        initiateResetDto.email
      );
    });
  });

  describe('resetPassword', () => {
    it('should call authService.resetPassword and return the result', async () => {
      const resetPasswordDto: resetPasswordDto = {
        token: 'token',
        password: 'password',
      };

      const expectedResult = {
        message: 'Password reset successfully',
      };

      jest
        .spyOn(authService, 'resetPassword')
        .mockResolvedValue(expectedResult as never);

      const result = await controller.resetPassword(resetPasswordDto);

      expect(authService.resetPassword).toHaveBeenCalledWith(resetPasswordDto);

      expect(result).toEqual(expectedResult);
    });

    it('should throw NotFoundException if authService.resetPassword throws an error', async () => {
      const resetPasswordDto: resetPasswordDto = {
        token: 'token',
        password: 'password',
      };

      const error = new Error('Password reset failed');

      jest.spyOn(authService, 'resetPassword').mockRejectedValue(error);

      await expect(controller.resetPassword(resetPasswordDto)).rejects.toThrow(
        NotFoundException
      );

      expect(authService.resetPassword).toHaveBeenCalledWith(resetPasswordDto);
    });
  });
});
