/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Post,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  UnauthorizedException,
  NotFoundException,
  ConflictException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {
  verifyDto,
  refreshTokenDto,
  initiateResetDto,
  resetPasswordDto,
  verify2faDto,
} from './dto/misc-dto';
import { LoginDto } from './dto/login-dto';
import { CreateSchoolDto } from './dto/create-school.dto';
import { CurrentUserId } from '../shared/decorators/get-current-user-id.decorator';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
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

  @Post('2fa-verify')
  @ApiOperation({ summary: 'Verify 2fa' })
  @ApiOkResponse({
    description: '2fa verified successfully',
  })
  @ApiNotFoundResponse({
    description: 'Invalid code or email',
  })
  @HttpCode(HttpStatus.OK)
  async verify(@Body() verify2faDto: verify2faDto) {
    try {
      return await this.authService.verify2fa(verify2faDto);
    } catch (error) {
      this.logger.error(error.message);
      throw new NotFoundException(error.message);
    }
  }

  @Post('initiate-verify')
  @ApiOperation({ summary: 'Initiate verification' })
  @ApiOkResponse({
    description:
      'Verification initiated check your mail for further instructions',
  })
  @ApiNotFoundResponse({
    description: 'Invalid email',
  })
  @HttpCode(HttpStatus.OK)
  async initiateVerify(@Body() initiateResetDto: initiateResetDto) {
    try {
      return await this.authService.send2faEmail(initiateResetDto.email);
    } catch (error) {
      this.logger.error(error.message);
      throw new NotFoundException(error.message);
    }
  }

  @Post('enable2fa')
  @ApiOperation({ summary: 'Enable Two factor authentication' })
  @ApiOkResponse({
    description: '2fa enabled successfully',
  })
  @ApiNotFoundResponse({
    description: 'Invalid user',
  })
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async enable2fa(@CurrentUserId() userId: string) {
    try {
      return await this.authService.enable2fa(userId);
    } catch (error) {
      this.logger.error(error.message);
      throw new NotFoundException(error.message);
    }
  }

  @Post('disable2fa')
  @ApiOperation({ summary: 'Disable Two factor authentication' })
  @ApiOkResponse({
    description: '2fa disabled successfully',
  })
  @ApiNotFoundResponse({
    description: 'Invalid user',
  })
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async disable2fa(@CurrentUserId() userId: string) {
    try {
      return await this.authService.disable2fa(userId);
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
