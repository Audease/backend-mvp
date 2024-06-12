import {
  Controller,
  Post,
  Body,
  Logger,
  UseGuards,
  HttpStatus,
  HttpCode,
  HttpException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateAccountsService } from './create-accounts.service';
import { GetCurrentUserId } from '../shared/decorators/get-current-user-id.decorator';
import { CreateAccountDto } from './dto/create-create-account.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('Create Accounts')
@Controller('create-account')
export class CreateAccountsController {
  private readonly logger = new Logger(CreateAccountsController.name);
  constructor(private readonly createAccountsService: CreateAccountsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/recruiter')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create recruiter account' })
  @ApiCreatedResponse({
    description: 'User created successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @HttpCode(HttpStatus.CREATED)
  async register(
    @GetCurrentUserId() userId: string,
    @Body() createUserDto: CreateAccountDto
  ) {
    try {
      return await this.createAccountsService.addRecruiter(
        userId,
        createUserDto
      );
    } catch (error) {
      this.logger.error(error.message);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  @UseGuards(JwtAuthGuard)
  @Post('/financial-aid-officer')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create financial aid officer account' })
  @ApiCreatedResponse({
    description: 'User created successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @GetCurrentUserId() userId: string,
    @Body() createUserDto: CreateAccountDto
  ) {
    try {
      return await this.createAccountsService.addFinancialAidOfficer(
        userId,
        createUserDto
      );
    } catch (error) {
      this.logger.error(error.message);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('/student')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create student account' })
  @ApiCreatedResponse({
    description: 'User created successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @HttpCode(HttpStatus.CREATED)
  async createStudent(
    @GetCurrentUserId() userId: string,
    @Body() createUserDto: CreateAccountDto
  ) {
    try {
      return await this.createAccountsService.addStudent(
        userId,
        createUserDto
      );
    } catch (error) {
      this.logger.error(error.message);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
