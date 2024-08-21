import {
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Logger,
  NotFoundException,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUserId } from '../shared/decorators/get-current-user-id.decorator';
import { AuditorService } from './auditor.service';
import { FilterParam } from './dto/auditor-filter.dto';

@ApiTags('AUDITOR DASHBOARD')
@UseGuards(JwtAuthGuard)
@Controller('audit')
export class AuditorController {
  private readonly logger = new Logger(AuditorController.name);
  constructor(private readonly auditorService: AuditorService) {}
  @Get('/students')
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
  @ApiQuery({
    name: 'funding',
    type: String,
    required: false,
    description: 'Funding query for filtering results',
  })
  @ApiQuery({
    name: 'course_status',
    type: String,
    required: false,
    description: 'Course status query for filtering results',
  })

  @ApiQuery({
    name: 'chosen_course',
    type: String,
    required: false,
    description: 'Chosen course query for filtering results',
  })
  @ApiOperation({
    summary: 'View information of all students on the Auditor dashboard',
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiUnauthorizedResponse({
    description: 'Account has expired',
  })
  @HttpCode(HttpStatus.OK)
  async findAll(
    @CurrentUserId() userId: string,
    @Query() filters: FilterParam
  ) {
    try {
      return await this.auditorService.getAllStudents(userId, filters);
    } catch (error) {
      this.logger.error(error.message);
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      } else {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
  }

  @Get('/analytics/course-status-distribution')
  @ApiOperation({
    summary:
      'Get Statistics of Course Status of all students on the Auditor dashboard',
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiUnauthorizedResponse({
    description: 'Account has expired',
  })
  @HttpCode(HttpStatus.OK)
  async getCourseStatusStatistics(@CurrentUserId() userId: string) {
    try {
      return await this.auditorService.getCourseStatusDistribution(userId);
    } catch (error) {
      this.logger.error(error.message);
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      } else {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
  }

  @Get('/analytics/total-registered-learners')
  @ApiOperation({
    summary: 'Get Total Number of Learners on the Auditor dashboard',
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiUnauthorizedResponse({
    description: 'Account has expired',
  })
  @HttpCode(HttpStatus.OK)
  async getTotalLearners(@CurrentUserId() userId: string) {
    try {
      return await this.auditorService.getTotalNumberOfLearners(userId);
    } catch (error) {
      this.logger.error(error.message);
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      } else {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
  }

  @Get('/analytics/total-completed-learners')
  @ApiOperation({
    summary: 'Get Total Number of Completed Learners  on the Auditor dashboard',
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiUnauthorizedResponse({
    description: 'Account has expired',
  })
  @HttpCode(HttpStatus.OK)
  async getCompletedLearners(@CurrentUserId() userId: string) {
    try {
      return await this.auditorService.getCompletedLearners(userId);
    } catch (error) {
      this.logger.error(error.message);
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      } else {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
  }

  @Get('/analytics/total-not-completed-learners')
  @ApiOperation({
    summary:
      'Get Total Number of Not Completed Learners  on the Auditor dashboard',
  })
  @ApiOkResponse({ description: 'OK' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiUnauthorizedResponse({
    description: 'Account has expired',
  })
  @HttpCode(HttpStatus.OK)
  async getNotCompletedLearners(@CurrentUserId() userId: string) {
    try {
      return await this.auditorService.getNotCompletedLearners(userId);
    } catch (error) {
      this.logger.error(error.message);
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      } else {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
  }

  @Get('/analytics/new-learners')
  @ApiOperation({
    summary:
      'Get Number of New Learners For Lat 10 Days  on the Auditor dashboard',
  })
  @ApiOkResponse({ description: 'OK' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiUnauthorizedResponse({
    description: 'Account has expired',
  })
  @HttpCode(HttpStatus.OK)
  async getLearners(@CurrentUserId() userId: string) {
    try {
      return await this.auditorService.getNewStudentsForLast10Days(userId);
    } catch (error) {
      this.logger.error(error.message);
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      } else {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
  }
}
