import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Logger,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InductorService } from './inductor.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { Permission } from '../utils/enum/permission';
import { Permissions } from '../shared/decorators/permission.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUserId } from '../shared/decorators/get-current-user-id.decorator';
import { SendMeetingDto } from './dto/send-meeting.dto';
import { UpdateAttendanceStatusDto } from './dto/update-attendance-status.dto';
import { FilterDto } from './dto/inductor-filter.dto';

@ApiTags('INDUCTOR DASHBOARD')
@Controller('induction')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class InductorController {
  private readonly logger = new Logger(InductorController.name);
  constructor(private readonly inductorService: InductorService) {}

  @Get('/students')
  @Permissions(Permission.INDUCTION)
  @ApiBearerAuth()
  @ApiQuery({
    name: 'page',
    type: Number,
    required: true,
    description: 'Page number for pagination',
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: true,
    description: 'Number of items per page',
  })
  @ApiOperation({
    summary:
      'View paginated information of all students on the Inductor dashboard',
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiNotFoundResponse({ description: 'Accessor not found for the user' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @HttpCode(HttpStatus.OK)
  async findAllPaginated(
    @CurrentUserId() userId: string,
    @Query('page') page: number,
    @Query('limit') limit: number
  ) {
    try {
      return await this.inductorService.getAllStudents(userId, page, limit);
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

  @Get('/students/filter')
  @Permissions(Permission.INDUCTION)
  @ApiBearerAuth()
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
    name: 'chosen_course',
    type: String,
    required: false,
    description: 'Chosen course query for filtering results',
  })
  @ApiQuery({
    name: 'application_status',
    type: String,
    required: false,
    description: 'Application status query for filtering results',
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
    summary: 'View filtered information of students on the Inductor dashboard',
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiNotFoundResponse({ description: 'Accessor not found for the user' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @HttpCode(HttpStatus.OK)
  async findAllFiltered(
    @CurrentUserId() userId: string,
    @Query() filters: FilterDto
  ) {
    try {
      return await this.inductorService.getFilteredStudents(userId, filters);
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
  @Permissions(Permission.INDUCTION)
  @ApiBearerAuth()
  @ApiParam({
    name: 'studentId',
    type: String,
    description: 'ID of the student',
  })
  @ApiOperation({
    summary: 'View information of a student on the Inductor dashboard',
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
      return await this.inductorService.getStudent(userId, studentId);
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

  // src/inductor/inductor.controller.ts

  @Post('/students/:studentId/inductor')
  @Permissions(Permission.INDUCTION)
  @ApiBearerAuth()
  @ApiParam({
    name: 'studentId',
    type: String,
    description: 'ID of the student',
  })
  @ApiOperation({
    summary: 'Send a meeting link to a student',
    description:
      'You can either provide individual meeting details or paste full meeting information',
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiNotFoundResponse({ description: 'Student not found' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @HttpCode(HttpStatus.OK)
  async sendMeetingLink(
    @CurrentUserId() userId: string,
    @Param('studentId') studentId: string,
    @Body() sendMeetingDto: SendMeetingDto
  ) {
    try {
      return await this.inductorService.sendMeetingLink(
        userId,
        studentId,
        sendMeetingDto
      );
    } catch (error) {
      this.logger.error(`Error sending meeting link: ${error.message}`);
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      } else if (error instanceof BadRequestException) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      } else if (error instanceof ConflictException) {
        throw new HttpException(error.message, HttpStatus.CONFLICT);
      } else {
        throw new HttpException(
          'An error occurred while sending meeting details',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
  }

  @Post('/students/:studentId/attendance-status')
  @Permissions(Permission.INDUCTION)
  @ApiBearerAuth()
  @ApiParam({
    name: 'studentId',
    type: String,
    description: 'ID of the student',
  })
  @ApiBody({
    type: UpdateAttendanceStatusDto,
    description: 'Attendance status to be updated',
  })
  @ApiOperation({
    summary: 'Update attendance status for a student on the Inductor dashboard',
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
  async updateAttendanceStatus(
    @CurrentUserId() userId: string,
    @Param('studentId') studentId: string,
    @Body() attendanceStatus: UpdateAttendanceStatusDto
  ) {
    try {
      return await this.inductorService.updateAttendanceStatus(
        userId,
        studentId,
        attendanceStatus.attendance_status
      );
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
