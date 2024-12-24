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
import { LazerService } from './lazer.service';
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

@ApiTags('LAZER DASHBOARD')
@Controller('lazer')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class LazerController {
  private readonly logger = new Logger(LazerController.name);
  constructor(private readonly lazerService: LazerService) {}

  @Get('/students')
  @Permissions(Permission.LEARNING)
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
      'View paginated information of all students on the Lazer dashboard',
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
    return await this.lazerService.getAllStudents(userId, page, limit);
  }

  @Get('/students/filter')
  @Permissions(Permission.LEARNING)
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
    name: 'search',
    type: String,
    required: false,
    description: 'Search for a student',
  })
  @ApiOperation({
    summary: 'Filter students on the Lazer dashboard',
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
    return await this.lazerService.getFilteredStudents(userId, filters);
  }

  @Post('/students/:studentId/approve')
  @Permissions(Permission.LEARNING)
  @ApiBearerAuth()
  @ApiParam({
    name: 'studentId',
    type: String,
    description: 'ID of the student',
  })
  @ApiOperation({
    summary: 'Approve a student on the Lazer dashboard',
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
      return await this.lazerService.approveStudent(userId, studentId);
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
