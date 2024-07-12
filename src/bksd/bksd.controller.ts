import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Logger,
  HttpCode,
  HttpStatus,
  HttpException,
  Query,
} from '@nestjs/common';
import { BksdService } from './bksd.service';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/role.guard';
import { Roles } from '../shared/decorators/roles.decorator';
import { Role } from '../utils/enum/role';
import { CurrentUserId } from '../shared/decorators/get-current-user-id.decorator';
import { PaginationParamsDto } from '../recruiter/dto/pagination-params.dto';

@ApiTags('BKSD DASHBOARD')
@Controller('bksd')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BksdController {
  private readonly logger = new Logger(BksdController.name);
  constructor(private readonly bksdService: BksdService) {}

  @Post('/send-mail/:learnerId')
  @Roles(Role.ACCESSOR)
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
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

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
      this.logger.error(error.message, error.stack);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
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
      this.logger.error(error.message, error.stack);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

}
