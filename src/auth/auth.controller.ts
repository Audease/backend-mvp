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
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { TokenResponseDto } from './dto/token-response.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login in a user' })
  @ApiResponse({
    status: 200,
    description: 'Successful login',
    type: TokenResponseDto,
    schema: {
      example: {
        token: {
          access: {
            token:
              'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2YmI3MjJmZC00NjZjLTRlY2UtYmY3NC03MTQ2NGYyMTYyZWMiLCJyb2xlX2lkIjoiMDcxODZhMDktOGNlZC00ZTZjLWFmY2EtNTRkMjI2NTk2MzYzIiwiZXhwIjoxNzE2NzUyMTA1LCJpYXQiOjE3MTY3NTEyMDUsInR5cGUiOiJhY2Nlc3MifQ.JRid7DqrU78WzTjO77HMFoHwalzIONjaNyIQStaWe3Y',
            expires: '2024-05-26T19:35:05.506Z',
          },
          refresh: {
            token:
              'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2YmI3MjJmZC00NjZjLTRlY2UtYmY3NC03MTQ2NGYyMTYyZWMiLCJyb2xlX2lkIjoiMDcxODZhMDktOGNlZC00ZTZjLWFmY2EtNTRkMjI2NTk2MzYzIiwiZXhwIjoxNzE3MzU2MDA1LCJpYXQiOjE3MTY3NTEyMDUsInR5cGUiOiJyZWZyZXNoIn0.df3ZpU4yXy2e9UFA8kxBJsE36oaZRESP-alHPGQ6JCg',
            expires: '2024-06-02T19:20:05.507Z',
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  async login(@Body() loginDto: LoginDto) {
    try {
      return await this.authService.login(loginDto);
    } catch (error) {
      this.logger.error(error.message);
      throw new UnauthorizedException(error.message);
    }
  }


  @Post('verify-school')
  @ApiOperation({ summary: 'Verify school' })
  @ApiOkResponse({
    description: 'The school verification was successful',
  })
  @ApiNotFoundResponse({
    description: 'Invalid Key',
  })
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
  @ApiOperation({ summary: 'Verify onboarding key' })
  @ApiOkResponse({
    description: 'Key verified successfully',
  })
  @ApiNotFoundResponse({
    description: 'Invalid Key',
  })
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
  @ApiOperation({ summary: 'Get refresh token' })
  @ApiOkResponse({
    schema: {
      example: {
        token:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0ODc3M2E3Zi0zMmMwLTQ2Mz',
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() refreshTokenDto: refreshTokenDto) {
    try {
      return await this.authService.refreshToken(refreshTokenDto.refreshToken);
    } catch (error) {
      this.logger.error(error.message);
      throw new NotFoundException(error.message);
    }
  }

  @Post('signup')
  @ApiOperation({ summary: 'Create a school and create a user account' })
  @ApiCreatedResponse({
    description:
      'The message that verifies that the actions have been performed and the onboarding key for the school verification and registration',
  })
  @ApiConflictResponse({
    description: 'School already exists, contact support for any question.',
  })
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
  @ApiOperation({ summary: 'Initiate password reset' })
  @ApiOkResponse({
    description:
      'Password reset initiated check your mail for further instructions',
  })
  @ApiNotFoundResponse({
    description: 'Invalid email',
  })
  @HttpCode(HttpStatus.OK)
  async initiateReset(@Body() initiateResetDto: initiateResetDto) {
    try {
      return await this.authService.initiatePasswordReset(
        initiateResetDto.email
      );
    } catch (error) {
      this.logger.error(error.message);
      throw new NotFoundException(error.message);
    }
  }
  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password' })
  @ApiOkResponse({
    description: 'Password reset successfully',
  })
  @ApiNotFoundResponse({
    description: 'Invalid Token',
  })
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
