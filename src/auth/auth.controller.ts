/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Post,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  HttpException,
  Logger,
  UnauthorizedException,
  NotFoundException,
  ConflictException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {
  verifyDto,
  refreshTokenDto,
  initiateResetDto,
  resetPasswordDto,
} from './dto/misc-dto';
import { LoginDto } from './dto/login-dto';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateSchoolDto } from './dto/create-school.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { GetCurrentUserId } from '../shared/decorators/get-current-user-id.decorator';
import { CreateAccountDto } from './dto/create-account.dto';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    try {
      return await this.authService.login(loginDto);
    } catch (error) {
      this.logger.error(error.message);
      throw new UnauthorizedException(error.message);
    }
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() createUserDto: CreateUserDto) {
    try {
      return await this.authService.createUser(createUserDto);
    } catch (error) {
      this.logger.error(error.message);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('/create-account/recruiter')
  @HttpCode(HttpStatus.CREATED)
  async registerRecruiter(
    @GetCurrentUserId() userId: string,
    @Body() createUserDto: CreateAccountDto,
  ) {
    try {
      return await this.authService.addRecruiter(userId, createUserDto);
    } catch (error) {
      this.logger.error(error.message);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('verify-school')
  @HttpCode(HttpStatus.OK)
  async verifySchool(@Body() verifyDto: verifyDto) {
    try {
      return await this.authService.verifySchool(verifyDto.keyId);
    } catch (error) {
      this.logger.error(error.message);
      throw new NotFoundException(error.message);
    }
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  async verify(@Body() verifyDto: verifyDto) {
    try {
      return await this.authService.verifyKey(verifyDto.keyId);
    } catch (error) {
      this.logger.error(error.message);
      throw new NotFoundException(error.message);
    }
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() refreshTokenDto: refreshTokenDto) {
    try {
      return await this.authService.refreshToken(refreshTokenDto.refreshToken);
    } catch (error) {
      this.logger.error(error.message);
      throw new NotFoundException(error.message);
    }
  }

  @Post('create-school')
  @HttpCode(HttpStatus.CREATED)
  async createSchool(@Body() createSchoolDto: CreateSchoolDto) {
    try {
      return await this.authService.createSchool(createSchoolDto);
    } catch (error) {
      this.logger.error(error.message);
      throw new ConflictException(error.message);
    }
  }

  @Post('initiate-reset')
  @HttpCode(HttpStatus.OK)
  async initiateReset(@Body() initiateResetDto: initiateResetDto) {
    try {
      return await this.authService.initiatePasswordReset(
        initiateResetDto.email,
      );
    } catch (error) {
      this.logger.error(error.message);
      throw new NotFoundException(error.message);
    }
  }
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: resetPasswordDto) {
    try {
      return await this.authService.resetPassword(resetPasswordDto);
    } catch (error) {
      this.logger.error(error.message);
      throw new NotFoundException(error.message);
    }
  }
}
