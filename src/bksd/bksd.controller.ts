import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Logger,
  HttpCode,
  HttpStatus,
  HttpException,
  Query,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { BksdService } from './bksd.service';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUserId } from '../shared/decorators/get-current-user-id.decorator';
import { PaginationParamsDto } from '../recruiter/dto/pagination-params.dto';
import { FilterDto } from './dto/bksd-filter.dto';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { Permissions } from '../shared/decorators/permission.decorator';
import { Permission } from '../utils/enum/permission';

@ApiTags('BKSD DASHBOARD')
@Controller('bksd')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class BksdController {
  private readonly logger = new Logger(BksdController.name);
  constructor(private readonly bksdService: BksdService) {}

  @Post('/send-mail/:learnerId')
  @Permissions(Permission.APPLICATION)
  @ApiBearerAuth()
  @ApiParam({
    name: 'learnerId',
    type: String,
    description: 'ID of the learner',
  })
  @ApiOperation({
    summary: 'Send login details to applicant via BSKD Dashboard',
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiNotFoundResponse({ description: 'Accessor not found for the user' })
  @ApiNotFoundResponse({ description: 'Learner not found for the user' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @HttpCode(HttpStatus.OK)
  async sendLoginDetails(
    @CurrentUserId() userId: string,
    @Param('learnerId') learnerId: string
  ) {
    try {
      return await this.bksdService.sendLearnerMail(userId, learnerId);
    } catch (error) {
      this.logger.error(error.message);
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      } else if (error instanceof ConflictException) {
        throw new HttpException(error.message, HttpStatus.CONFLICT);
      } else {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
  }

  @Get('/students')
  @Permissions(Permission.APPLICATION)
  @ApiBearerAuth()
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
    description: 'Page number for pagination',
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description: 'Number of items per page',
  })
  @ApiQuery({
    name: 'search',
    type: String,
    required: false,
    description: 'Search query for filtering results',
  })
  @ApiOperation({
    summary: 'View information of all students on the BKSD dashboard',
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiNotFoundResponse({ description: 'Accessor not found for the user' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @HttpCode(HttpStatus.OK)
  async findAll(
    @CurrentUserId() userId: string,
    @Query() paginationParams: PaginationParamsDto
  ) {
    try {
      return await this.bksdService.getAllStudents(userId, paginationParams);
    } catch (error) {
      this.logger.error(error.message);
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      } else if (error instanceof ConflictException) {
        throw new HttpException(error.message, HttpStatus.CONFLICT);
      } else {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
  }

  @Get('students/filters')
  @Permissions(Permission.APPLICATION)
  @ApiBearerAuth()
  @ApiQuery({
    name: 'funding',
    type: String,
    required: false,
    description: 'Funding query for filtering results',
  })
  @ApiQuery({
    name: 'chosen_course',
    type: String,
    required: false,
    description: 'Chosen course query for filtering results',
  })
  @ApiQuery({
    name: 'application_mail',
    type: String,
    required: false,
    description: 'Mail status query for filtering results',
  })
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
    description: 'Page number for pagination',
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description: 'Number of items per page',
  })
  @ApiOperation({
    summary:
      'Filter students based on funding, chosen course and mail status  on the recruiter BKSD dashboard',
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiNotFoundResponse({ description: 'Accessor not found for the user' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @HttpCode(HttpStatus.OK)
  async filter(
    @CurrentUserId() userId: string,
    @Query() filterParams: FilterDto
  ) {
    try {
      return await this.bksdService.getFilteredStudents(userId, filterParams);
    } catch (error) {
      this.logger.error(error.message);
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      } else if (error instanceof ConflictException) {
        throw new HttpException(error.message, HttpStatus.CONFLICT);
      } else {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
  }

  @Get('/students/:studentId')
  @Permissions(Permission.APPLICATION)
  @ApiBearerAuth()
  @ApiParam({
    name: 'studentId',
    type: String,
    description: 'ID of the student',
  })
  @ApiOperation({
    summary: 'View information of a student on the BKSD dashboard',
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiNotFoundResponse({ description: 'Accessor not found for the user' })
  @ApiNotFoundResponse({
    description: 'Student with studentId not found for the user',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @HttpCode(HttpStatus.OK)
  async findOne(
    @CurrentUserId() userId: string,
    @Param('studentId') studentId: string
  ) {
    try {
      return await this.bksdService.getStudent(userId, studentId);
    } catch (error) {
      this.logger.error(error.message);
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      } else if (error instanceof ConflictException) {
        throw new HttpException(error.message, HttpStatus.CONFLICT);
      } else {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
  }
}
