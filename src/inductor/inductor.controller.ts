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
  Query,
  UseGuards,
} from '@nestjs/common';
import { InductorService } from './inductor.service';
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
import { FilterDto } from '../bksd/dto/bksd-filter.dto';
import { Role } from '../utils/enum/role';
import { Roles } from '../shared/decorators/roles.decorator';

@ApiTags('INDUCTOR DASHBOARD')
@Controller('induction')
@UseGuards(JwtAuthGuard)
export class InductorController {
  private readonly logger = new Logger(InductorController.name);
  constructor(private readonly inductorService: InductorService) {}

  @Get('/students')
  @Roles(Role.ACCESSOR)
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
  @ApiOperation({
    summary: 'View information of all students on the Inductor dashboard',
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiNotFoundResponse({ description: 'Accessor not found for the user' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @HttpCode(HttpStatus.OK)
  async findAll(@CurrentUserId() userId: string, @Query() filters: FilterDto) {
    try {
      return await this.inductorService.getAllStudents(userId, filters);
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
  @Roles(Role.ACCESSOR)
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
}
