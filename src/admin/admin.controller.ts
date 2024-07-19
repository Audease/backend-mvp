import {
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  Logger,
  HttpCode,
  InternalServerErrorException,
  Param,
  HttpStatus,
  UploadedFile,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { Role } from '../utils/enum/role';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../shared/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiBody,
  ApiQuery,
  ApiBearerAuth,
  ApiParam,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  ApiOperation,
  ApiInternalServerErrorResponse,
  ApiConsumes,
} from '@nestjs/swagger';
import { PaginationDto, EmailDto } from './dto/misc-dto';
import { CurrentUserId } from '../shared/decorators/get-current-user-id.decorator';

@ApiTags('Admin')
@UseGuards(JwtAuthGuard)
@Controller('admin')
export class AdminController {
  private readonly logger = new Logger(AdminController.name);

  constructor(private readonly adminService: AdminService) {}

  @Get('/students/search')
  @Roles(Role.SCHOOL_ADMIN)
  @ApiBearerAuth()
  @ApiQuery({
    name: 'search',
    type: String,
    required: true,
    description: 'Search query',
  })
  @ApiOperation({
    summary: 'Search for students in the school',
  })
  @ApiNotFoundResponse({ description: 'Admin not found' })
  @ApiNotFoundResponse({ description: 'Student not found' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @HttpCode(HttpStatus.OK)
  async searchStudents(
    @CurrentUserId() userId: string,
    @Query('search') search: string
  ) {
    try {
      return await this.adminService.searchStudent(userId, search);
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Get('/students')
  @Roles(Role.SCHOOL_ADMIN)
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
  @ApiOperation({
    summary: 'View information of all students on the recruiter dashboard',
  })
  @ApiNotFoundResponse({ description: 'Admin not found' })
  @ApiNotFoundResponse({
    description: 'This admin has no student registered to this school',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @HttpCode(HttpStatus.OK)
  async getAllStudents(
    @CurrentUserId() userId: string,
    @Query() pagination: PaginationDto
  ) {
    try {
      const { limit, page } = pagination;
      return await this.adminService.getPaginatedStudents(userId, page, limit);
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Get('/logs')
  @Roles(Role.SCHOOL_ADMIN)
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
  @ApiOperation({
    summary: 'View information a log of all actions performed by the admin',
  })
  @ApiNotFoundResponse({ description: 'Admin not found' })
  @ApiNotFoundResponse({
    description: 'This admin has not performed any actions yet',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @HttpCode(HttpStatus.OK)
  async getAllLogs(
    @CurrentUserId() userId: string,
    @Query() pagination: PaginationDto
  ) {
    try {
      const { limit, page } = pagination;
      return await this.adminService.getLogs(userId, page, limit);
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Get('/students/:studentId')
  @Roles(Role.SCHOOL_ADMIN)
  @ApiBearerAuth()
  @ApiParam({
    name: 'studentId',
    type: String,
    required: true,
    description: 'Student ID',
  })
  @ApiOperation({
    summary: 'View information of a student on the recruiter dashboard',
  })
  @ApiNotFoundResponse({ description: 'Admin not found' })
  @ApiNotFoundResponse({ description: 'Student not found' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @HttpCode(HttpStatus.OK)
  async getStudent(
    @CurrentUserId() userId: string,
    @Param('studentId') studentId: string
  ) {
    try {
      return await this.adminService.getStudentById(userId, studentId);
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Post('/students/:studentId/documents')
  @Roles(Role.SCHOOL_ADMIN)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'File upload',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiParam({
    name: 'studentId',
    type: String,
    required: true,
    description: 'Student ID',
  })
  @ApiOperation({
    summary: 'Upload documents to student profile',
  })
  @ApiNotFoundResponse({ description: 'Admin not found' })
  @ApiNotFoundResponse({ description: 'Student not found' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiInternalServerErrorResponse({
    description: 'Issues uploading this file',
  })
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @CurrentUserId() userId: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    try {
      return await this.adminService.uploadDocument(userId, file);
    } catch (error) {
      this.logger.error(error.message, error.stack);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Get('/profile')
  @Roles(Role.SCHOOL_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'View profile of the admin',
  })
  @ApiNotFoundResponse({ description: 'Admin not found' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @HttpCode(HttpStatus.OK)
  async getProfile(@CurrentUserId() userId: string) {
    try {
      return await this.adminService.getAdminDetails(userId);
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Post('/invite')
  @Roles(Role.SCHOOL_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Invite a user to the platform',
  })
  @ApiNotFoundResponse({ description: 'Admin not found' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @HttpCode(HttpStatus.OK)
  async inviteUser(@CurrentUserId() userId: string, @Body() email: EmailDto) {
    try {
      return await this.adminService.sendInvitation(userId, email.email);
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Get('/learners')
  @Roles(Role.SCHOOL_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'View all learners in the school',
  })
  @ApiNotFoundResponse({ description: 'Admin not found' })
  @ApiNotFoundResponse({ description: 'Learners not found' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @HttpCode(HttpStatus.OK)
  async getLearners(
    @CurrentUserId() userId: string,
    @Query() pagination: PaginationDto
  ) {
    try {
      const { limit, page } = pagination;
      return await this.adminService.getLearners(userId, page, limit);
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Get('/learners/:learnerId')
  @Roles(Role.SCHOOL_ADMIN)
  @ApiBearerAuth()
  @ApiParam({
    name: 'learnerId',
    type: String,
    required: true,
    description: 'Learner ID',
  })
  @ApiOperation({
    summary: 'View information of a learner on the admin dashboard',
  })
  @ApiNotFoundResponse({ description: 'Admin not found' })
  @ApiNotFoundResponse({ description: 'Learner not found' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @HttpCode(HttpStatus.OK)
  async getLearner(
    @CurrentUserId() userId: string,
    @Param('learnerId') learnerId: string
  ) {
    try {
      return await this.adminService.getLearnerById(userId, learnerId);
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Get('/staffs')
  @Roles(Role.SCHOOL_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'View all staffs in the school',
  })
  @ApiNotFoundResponse({ description: 'Admin not found' })
  @ApiNotFoundResponse({ description: 'Staffs not found' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @HttpCode(HttpStatus.OK)
  async getStaffs(
    @CurrentUserId() userId: string,
    @Query() pagination: PaginationDto
  ) {
    try {
      const { limit, page } = pagination;
      return await this.adminService.getStaffs(userId, page, limit);
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }
}
