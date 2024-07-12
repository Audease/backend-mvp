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
import { Roles } from '../shared/decorators/roles.decorator';
import { Role } from '../utils/enum/role';
import { RolesGuard } from '../auth/role.guard';
import { CreateAccountsService } from './create-accounts.service';
import { CurrentUserId } from '../shared/decorators/get-current-user-id.decorator';
import { CreateAccountDto } from './dto/create-create-account.dto';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CreateLearnerDto } from '../recruiter/dto/create-learner.dto';

@ApiTags('Create Accounts')
@Controller('create-account')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CreateAccountsController {
  private readonly logger = new Logger(CreateAccountsController.name);
  constructor(private readonly createAccountsService: CreateAccountsService) {}

  @Post('/recruiter')
  @Roles(Role.SCHOOL_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create recruiter account' })
  @ApiCreatedResponse({
    description: 'User created successfully',
  })
  @ApiConflictResponse({
    description: 'Email already exists',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @HttpCode(HttpStatus.CREATED)
  async register(
    @CurrentUserId() userId: string,
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
  @Post('/financial-aid-officer')
  @Roles(Role.SCHOOL_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create financial aid officer account' })
  @ApiCreatedResponse({
    description: 'User created successfully',
  })
  @ApiConflictResponse({
    description: 'Email already exists',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUserId() userId: string,
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

  @Post('/student')
  @Roles(Role.SCHOOL_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create student account' })
  @ApiCreatedResponse({
    description: 'User created successfully',
  })
  @ApiConflictResponse({
    description: 'Email already exists',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @HttpCode(HttpStatus.CREATED)
  async createStudent(
    @CurrentUserId() userId: string,
    @Body() createLearnerDto: CreateLearnerDto
  ) {
    try {
      return await this.createAccountsService.addStudent(
        userId,
        createLearnerDto
      );
    } catch (error) {
      this.logger.error(error.message);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('/auditor')
  @Roles(Role.SCHOOL_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create auditor account' })
  @ApiCreatedResponse({
    description: 'User created successfully',
  })
  @ApiConflictResponse({
    description: 'Email already exists',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @HttpCode(HttpStatus.CREATED)
  async createExternalAuditor(
    @CurrentUserId() userId: string,
    @Body() createUserDto: CreateAccountDto
  ) {
    try {
      return await this.createAccountsService.addAuditor(userId, createUserDto);
    } catch (error) {
      this.logger.error(error.message);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('/accessor')
  @Roles(Role.SCHOOL_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create accessor account' })
  @ApiCreatedResponse({
    description: 'User created successfully',
  })
  @ApiConflictResponse({
    description: 'Email already exists',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @HttpCode(HttpStatus.CREATED)
  async createAccessor(
    @CurrentUserId() userId: string,
    @Body() createUserDto: CreateAccountDto
  ) {
    try {
      return await this.createAccountsService.addAccessor(
        userId,
        createUserDto
      );
    } catch (error) {
      this.logger.error(error.message);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
