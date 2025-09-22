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
  Body,
} from '@nestjs/common';
import { BksdService } from './bksd.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUserId } from '../shared/decorators/get-current-user-id.decorator';
import { PaginationParamsDto } from '../recruiter/dto/pagination-params.dto';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { Permissions } from '../shared/decorators/permission.decorator';
import { Permission } from '../utils/enum/permission';
import { StudentFilterDto } from '../shared/dto/student-filter.dto';
import { BatchSendMailDto } from './dto/batch-send-email.dto';
import { BatchResendMailDto } from './dto/batch-resend-email.dto';

@ApiTags('BKSD DASHBOARD')
@Controller('bksd')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class BksdController {
  private readonly logger = new Logger(BksdController.name);
  constructor(private readonly bksdService: BksdService) {}

  @Post('/send-mail/batch')
  @Permissions(Permission.APPLICATION)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Send login details to multiple applicants via BKSD Dashboard',
    description:
      'Send login credentials to multiple learners in a single batch operation. Maximum 50 learners per batch.',
  })
  @ApiBody({ type: BatchSendMailDto })
  @ApiResponse({
    status: 200,
    description: 'Batch email operation completed',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Batch email operation completed' },
        summary: {
          type: 'object',
          properties: {
            totalRequested: { type: 'number', example: 5 },
            successful: { type: 'number', example: 4 },
            failed: { type: 'number', example: 1 },
            skipped: { type: 'number', example: 0 },
          },
        },
        results: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              learnerId: { type: 'string' },
              status: {
                type: 'string',
                enum: ['success', 'failed', 'skipped'],
              },
              message: { type: 'string' },
              learnerName: { type: 'string' },
              learnerEmail: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @HttpCode(HttpStatus.OK)
  async sendBatchLoginDetails(
    @CurrentUserId() userId: string,
    @Body() batchSendMailDto: BatchSendMailDto
  ) {
    try {
      return await this.bksdService.sendBatchLearnerMail(
        userId,
        batchSendMailDto.learnerIds
      );
    } catch (error) {
      this.logger.error(`Batch email error: ${error.message}`);
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      } else if (error instanceof ConflictException) {
        throw new HttpException(error.message, HttpStatus.CONFLICT);
      } else {
        throw new HttpException(
          'An error occurred while processing batch email operation',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
  }

  @Post('/resend-mail/batch')
  @Permissions(Permission.APPLICATION)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Resend login details to multiple existing students via BKSD Dashboard',
    description:
      'Resend login credentials to multiple learners who already have accounts. Maximum 50 learners per batch.',
  })
  @ApiBody({ type: BatchResendMailDto })
  @ApiResponse({
    status: 200,
    description: 'Batch resend email operation completed',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Batch resend email operation completed',
        },
        summary: {
          type: 'object',
          properties: {
            totalRequested: { type: 'number', example: 5 },
            successful: { type: 'number', example: 4 },
            failed: { type: 'number', example: 1 },
            skipped: { type: 'number', example: 0 },
          },
        },
        results: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              learnerId: { type: 'string' },
              status: {
                type: 'string',
                enum: ['success', 'failed', 'skipped'],
              },
              message: { type: 'string' },
              learnerName: { type: 'string' },
              learnerEmail: { type: 'string' },
              username: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @HttpCode(HttpStatus.OK)
  async resendBatchLoginDetails(
    @CurrentUserId() userId: string,
    @Body() batchResendMailDto: BatchResendMailDto
  ) {
    try {
      return await this.bksdService.resendBatchLearnerCredentials(
        userId,
        batchResendMailDto.learnerIds
      );
    } catch (error) {
      this.logger.error(`Batch resend email error: ${error.message}`);
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      } else if (error instanceof ConflictException) {
        throw new HttpException(error.message, HttpStatus.CONFLICT);
      } else {
        throw new HttpException(
          'An error occurred while processing batch resend email operation',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
  }

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
    @Query() filterParams: StudentFilterDto
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

  @Post('/resend-mail/:learnerId')
  @Permissions(Permission.APPLICATION)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Resend existing login details to student',
  })
  async resendLoginDetails(
    @CurrentUserId() userId: string,
    @Param('learnerId') learnerId: string
  ) {
    return await this.bksdService.resendLearnerCredentials(userId, learnerId);
  }
}
