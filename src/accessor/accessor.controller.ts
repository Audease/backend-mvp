import {
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AccessorService } from './accessor.service';
import { Roles } from '../shared/decorators/roles.decorator';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Role } from '../utils/enum/role';
import { CurrentUserId } from '../shared/decorators/get-current-user-id.decorator';
import { PaginationParamsDto } from '../recruiter/dto/pagination-params.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/role.guard';

@ApiTags('ACCESSOR DASHBOARD')
@Controller('accessor')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AccessorController {
  private readonly logger = new Logger(AccessorController.name);
  constructor(private readonly accessorService: AccessorService) {}
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
    summary: 'View information of all students on the Accessor dashboard',
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
      return await this.accessorService.getAllStudents(
        userId,
        paginationParams
      );
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
    summary: 'View information of a student on the Accessor dashboard',
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
      return await this.accessorService.getStudent(userId, studentId);
    } catch (error) {
      this.logger.error(error.message, error.stack);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

}
