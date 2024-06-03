import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { VerifyDto } from './dto/verify.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { CreateSchoolDto } from './dto/create-school.dto';
import { InitiateResetDto } from './dto/initiate-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import {
  UnauthorizedException,
  HttpException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('should call authService.login and return the result', async () => {
      const loginDto: LoginDto = {
        /* create a loginDto object with test data */
      };
      const expectedResult = {
        /* create the expected result object */
      };

      jest.spyOn(authService, 'login').mockResolvedValue(expectedResult);

      const result = await controller.login(loginDto);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(expectedResult);
    });

    it('should throw UnauthorizedException if authService.login throws an error', async () => {
      const loginDto: LoginDto = {
        /* create a loginDto object with test data */
      };
      const error = new Error('Login failed');

      jest.spyOn(authService, 'login').mockRejectedValue(error);

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });
  });

  // Add tests for other controller methods here
});
