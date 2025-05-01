import {
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
import { CertificateService } from './certificate.service';
import {
  ApiBearerAuth,
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
import { FilterDto } from '../bksd/dto/bksd-filter.dto';

@ApiTags('CERTIFICATE DASHBOARD')
@Controller('certificate')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class CertificateController {
  private readonly logger = new Logger(CertificateController.name);
  constructor(private readonly certificateService: CertificateService) {}

  @Get('/students')
  @Permissions(Permission.CERTIFICATE)
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
      'View paginated information of all students on the Certificate dashboard',
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiNotFoundResponse({ description: 'Accessor not found for the user' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  async getAllStudents(
    @CurrentUserId() userId: string,
    @Query('page') page: number,
    @Query('limit') limit: number
  ) {
    try {
      const data = await this.certificateService.getAllStudents(
        userId,
        page,
        limit
      );
      return data;
    } catch (error) {
      this.logger.error(error.message);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('/students/filter')
  @Permissions(Permission.CERTIFICATE)
  @ApiBearerAuth()
  @ApiQuery({
    name: 'funding',
    type: String,
    required: false,
    description: 'Filter by funding',
  })
  @ApiQuery({
    name: 'chosen_course',
    type: String,
    required: false,
    description: 'Filter by chosen course',
  })
  @ApiQuery({
    name: 'application_status',
    type: String,
    required: false,
    description: 'Filter by application status',
  })
  @ApiQuery({
    name: 'search',
    type: String,
    required: false,
    description: 'Search by first name, last name, middle name or email',
  })
  @ApiOperation({
    summary:
      'Filter students on the Certificate dashboard by funding, chosen course, application status or search by first name, last name, middle name or email',
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiNotFoundResponse({ description: 'Accessor not found for the user' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  async getFilteredStudents(
    @CurrentUserId() userId: string,
    @Query() filters: FilterDto
  ) {
    try {
      const data = await this.certificateService.getFilteredStudents(
        userId,
        filters
      );
      return data;
    } catch (error) {
      this.logger.error(error.message);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('/students/:studentId/approve')
  @Permissions(Permission.CERTIFICATE)
  @ApiBearerAuth()
  @ApiParam({
    name: 'studentId',
    type: String,
    description: 'ID of the student',
  })
  @ApiOperation({
    summary: 'Approve a student on the Certificate dashboard',
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
  async approveStudent(
    @CurrentUserId() userId: string,
    @Param('studentId') studentId: string
  ) {
    try {
      return await this.certificateService.approveStudent(userId, studentId);
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
