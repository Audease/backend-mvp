import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ArchiveService } from './archive.service';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUserId } from '../shared/decorators/get-current-user-id.decorator';
import { ArchiveStudentDto } from './dto/archive-student.dto';
import { FilterArchivedDto } from './dto/filtered-archive.dto';

@ApiTags('Student Archive')
@Controller('archive')
@UseGuards(JwtAuthGuard)
export class ArchiveController {
  private readonly logger = new Logger(ArchiveController.name);

  constructor(private readonly archiveService: ArchiveService) {}

  @Post('students/:studentId')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Archive a student' })
  @ApiParam({ name: 'studentId', description: 'Student ID to archive' })
  @ApiBody({ type: ArchiveStudentDto })
  @ApiResponse({ status: 200, description: 'Student archived successfully' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  async archiveStudent(
    @CurrentUserId() userId: string,
    @Param('studentId') studentId: string,
    @Body() archiveDto: ArchiveStudentDto
  ) {
    try {
      return await this.archiveService.archiveStudent(
        userId,
        studentId,
        archiveDto.reason
      );
    } catch (error) {
      this.logger.error(`Error archiving student: ${error.message}`);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to archive student');
    }
  }

  @Post('students/:studentId/restore')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Restore a student from archive' })
  @ApiParam({ name: 'studentId', description: 'Student ID to restore' })
  @ApiResponse({ status: 200, description: 'Student restored successfully' })
  @ApiResponse({ status: 404, description: 'Archived student not found' })
  async restoreStudent(
    @CurrentUserId() userId: string,
    @Param('studentId') studentId: string
  ) {
    try {
      return await this.archiveService.unarchiveStudent(userId, studentId);
    } catch (error) {
      this.logger.error(`Error restoring student: ${error.message}`);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to restore student');
    }
  }

  @Get('students')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all archived students' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page',
  })
  @ApiQuery({ name: 'search', required: false, description: 'Search term' })
  @ApiQuery({
    name: 'from_date',
    required: false,
    description: 'Archive date from',
  })
  @ApiQuery({
    name: 'to_date',
    required: false,
    description: 'Archive date to',
  })
  @ApiResponse({ status: 200, description: 'List of archived students' })
  async getArchivedStudents(
    @CurrentUserId() userId: string,
    @Query() filters: FilterArchivedDto
  ) {
    try {
      return await this.archiveService.getArchivedStudents(userId, filters);
    } catch (error) {
      this.logger.error(`Error getting archived students: ${error.message}`);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to get archived students');
    }
  }

  @Get('students/:studentId')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get an archived student by ID' })
  @ApiParam({ name: 'studentId', description: 'Archived student ID' })
  @ApiResponse({ status: 200, description: 'Archived student details' })
  @ApiResponse({ status: 404, description: 'Archived student not found' })
  async getArchivedStudent(
    @CurrentUserId() userId: string,
    @Param('studentId') studentId: string
  ) {
    try {
      return await this.archiveService.getArchivedStudentById(
        userId,
        studentId
      );
    } catch (error) {
      this.logger.error(`Error getting archived student: ${error.message}`);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to get archived student');
    }
  }
}
