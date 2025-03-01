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
  Delete,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Role } from '../utils/enum/role';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
// import { RolesGuard } from '../auth/role.guard';
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
  ApiResponse,
} from '@nestjs/swagger';
import { RolesGuard } from '../auth/guards/role.guard';
import { PaginationDto, EmailDto, AssignRolesDto } from './dto/misc-dto';
import { CurrentUserId } from '../shared/decorators/get-current-user-id.decorator';
import { CreateStaffDto } from './dto/create-staff.dto';
import { RoleDto } from './dto/create-role.dto';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { CreateFolderDto } from './dto/create-folder.dto';
import { CreateWorflowDto } from './dto/workflow.dto';
import { Permissions } from '../shared/decorators/permission.decorator';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { Permission } from '../utils/enum/permission';
import { CreateDocumentDto } from './dto/create-document.dto';
import { AddDocumentsToStudentDto } from './dto/add-student-document.dto';

@ApiTags('Admin')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
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

  @Post('/students/:studentId/documents')
  @Roles(Role.SCHOOL_ADMIN)
  @Permissions(Permission.LEARNER)
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

  @Post('students/:studentId/documents')
  @Roles(Role.SCHOOL_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add multiple documents to a student' })
  @ApiParam({
    name: 'studentId',
    description: 'ID of the student',
    type: String,
  })
  @ApiResponse({
    status: 201,
    description: 'Documents successfully added to student',
  })
  @ApiResponse({ status: 404, description: 'Student or document not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async addDocumentsToStudent(
    @Param('studentId') studentId: string,
    @Body() addDocumentsDto: AddDocumentsToStudentDto
  ) {
    return this.adminService.addDocumentToStudent(
      studentId,
      addDocumentsDto.documentIds
    );
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

  @Post('/staffs/assign-roles')
  @Roles(Role.SCHOOL_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Assign roles to staff members',
  })
  @ApiNotFoundResponse({ description: 'Staff not found' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @HttpCode(HttpStatus.OK)
  async assignRoles(
    @CurrentUserId() adminId: string,
    @Body() assignRolesDto: AssignRolesDto
  ) {
    try {
      return await this.adminService.assignRoles(
        adminId,
        assignRolesDto.assignments
      );
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Get('/account-setup-status')
  @Roles(Role.SCHOOL_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'View account setup status',
  })
  @ApiNotFoundResponse({ description: 'Admin not found' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @HttpCode(HttpStatus.OK)
  async getAccountSetupStatus(@CurrentUserId() userId: string) {
    try {
      return await this.adminService.getOnboardingStatus(userId);
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Get('/roles')
  @Roles(Role.SCHOOL_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'View all roles in the school',
  })
  @ApiNotFoundResponse({ description: 'Admin not found' })
  @ApiNotFoundResponse({ description: 'Roles not found' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @HttpCode(HttpStatus.OK)
  async getRoles(@CurrentUserId() userId: string) {
    try {
      return await this.adminService.getRoles(userId);
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Get('/permissions')
  @Roles(Role.SCHOOL_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'View all permissions in the school',
  })
  @ApiNotFoundResponse({ description: 'Admin not found' })
  @ApiNotFoundResponse({ description: 'Permissions not found' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @HttpCode(HttpStatus.OK)
  async getPermissions(@CurrentUserId() userId: string) {
    try {
      return await this.adminService.getPermissions(userId);
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Post('/create-staff')
  @Roles(Role.SCHOOL_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create staff in the school',
  })
  @ApiNotFoundResponse({ description: 'Admin not found' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @HttpCode(HttpStatus.CREATED)
  async createStaff(
    @CurrentUserId() userId: string,
    @Body() createStaffDto: CreateStaffDto
  ) {
    try {
      return await this.adminService.createStaff(userId, createStaffDto);
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Post('/create-role')
  @Roles(Role.SCHOOL_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a role in the school',
  })
  @ApiNotFoundResponse({ description: 'Admin not found' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @HttpCode(HttpStatus.CREATED)
  async createRole(@CurrentUserId() userId: string, @Body() roleDto: RoleDto) {
    try {
      return await this.adminService.createRole(userId, roleDto);
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Post('/trash/:logId')
  @Roles(Role.SCHOOL_ADMIN)
  @ApiBearerAuth()
  @ApiParam({
    name: 'logId',
    type: String,
    required: true,
    description: 'Log ID',
  })
  @ApiOperation({
    summary: 'Trash a log',
  })
  @ApiNotFoundResponse({ description: 'Admin not found' })
  @ApiNotFoundResponse({ description: 'Log not found' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @HttpCode(HttpStatus.OK)
  async trashLog(
    @CurrentUserId() userId: string,
    @Param('logId') logId: string
  ) {
    try {
      return await this.adminService.moveToTrash(userId, logId);
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Get('folders')
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
    summary: 'Get all folders with their subfolders and documents',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns folders with pagination',
  })
  async getAllFolders(
    @CurrentUserId() userId: string,
    @Query() pagination: PaginationDto
  ) {
    const { page, limit } = pagination;
    return await this.adminService.getAllFolders(userId, page, limit);
  }

  @Post('folders/:folderId/documents')
  @Roles(Role.SCHOOL_ADMIN)
  @ApiParam({
    name: 'folderId',
    type: String,
    required: true,
    description: 'ID of the folder to add document to',
  })
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a document in a folder using Cloudinary URL',
    description:
      'Save document metadata and Cloudinary URL in a specific folder',
  })
  @ApiResponse({
    status: 201,
    description: 'Document created successfully',
  })
  @ApiBody({ type: CreateDocumentDto })
  async createDocument(
    @CurrentUserId() userId: string,
    @Param('folderId') folderId: string,
    @Body() createDocumentDto: CreateDocumentDto
  ) {
    return await this.adminService.createDocument(
      userId,
      folderId,
      createDocumentDto
    );
  }

  @Post('folders')
  @Roles(Role.SCHOOL_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a folder or subfolder',
    description:
      'Creates a new folder. If parentFolderId is provided, creates a subfolder.',
  })
  @ApiResponse({
    status: 201,
    description: 'Folder created successfully',
  })
  @ApiBody({ type: CreateFolderDto })
  async createFolder(
    @CurrentUserId() userId: string,
    @Body() createFolderDto: CreateFolderDto
  ) {
    const { name, parentFolderId } = createFolderDto;
    return await this.adminService.createFolder(name, userId, parentFolderId);
  }

  @Get('folders/:folderId')
  @Roles(Role.SCHOOL_ADMIN)
  async getFolderContents(
    @CurrentUserId() userId: string,
    @Param('folderId') folderId: string,
    @Query() pagination: PaginationDto
  ) {
    const { limit, page } = pagination;
    return await this.adminService.getFolderContents(
      userId,
      folderId,
      page,
      limit
    );
  }

  @Post('/documents/school')
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
  @ApiOperation({
    summary: 'Upload documents to school profile',
  })
  @ApiNotFoundResponse({ description: 'Admin not found' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiInternalServerErrorResponse({
    description: 'Issues uploading this file',
  })
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  async uploadSchoolDocument(
    @CurrentUserId() userId: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    try {
      return await this.adminService.saveSchoolDocument(userId, file);
    } catch (error) {
      this.logger.error(error.message, error.stack);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Get('/new-staff')
  @Roles(Role.SCHOOL_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'View all new staffs in the school',
  })
  @ApiNotFoundResponse({ description: 'Admin not found' })
  @ApiNotFoundResponse({ description: 'Staffs not found' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @HttpCode(HttpStatus.OK)
  async getNewStaffs(
    @CurrentUserId() userId: string,
    @Query() pagination: PaginationDto
  ) {
    try {
      const { limit, page } = pagination;
      return await this.adminService.getNewStaffs(userId, page, limit);
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Post('/create-workflow')
  @Roles(Role.SCHOOL_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a workflow in the school',
  })
  @ApiNotFoundResponse({ description: 'Admin not found' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @HttpCode(HttpStatus.CREATED)
  async createWorkflow(
    @CurrentUserId() userId: string,
    @Body() workflow: CreateWorflowDto
  ) {
    try {
      return await this.adminService.createWorkflow(userId, workflow);
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Get('/workflows')
  @Roles(Role.SCHOOL_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'View all workflows in the school',
  })
  @ApiNotFoundResponse({ description: 'Admin not found' })
  @ApiNotFoundResponse({ description: 'Workflows not found' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @HttpCode(HttpStatus.OK)
  async getWorkflows(@CurrentUserId() userId: string) {
    try {
      return await this.adminService.getWorkflows(userId);
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Post('/persona-staff')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'View all persona staffs in the school',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        permission: { type: 'string' },
        page: { type: 'number', default: 1 },
        limit: { type: 'number', default: 10 },
      },
      required: ['permission'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved staff list',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Admin or staffs not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @HttpCode(HttpStatus.OK)
  async getPersonaStaffs(
    @CurrentUserId() userId: string,
    @Body() body: { permission: string; page?: number; limit?: number }
  ) {
    try {
      const { permission, page = 1, limit = 10 } = body;

      if (!permission) {
        throw new BadRequestException('Permission is required');
      }

      return await this.adminService.getStaffsByPermission(
        userId,
        permission,
        page,
        limit
      );
    } catch (error) {
      this.logger.error(`Error in getPersonaStaffs: ${error.message}`);
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }

  @Delete('/delete/:staffId')
  @Roles(Role.SCHOOL_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete a staff',
  })
  @ApiNotFoundResponse({ description: 'Admin not found' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiParam({
    name: 'staffId',
    type: String,
    description: 'ID of the staff to be deleted',
  })
  @HttpCode(HttpStatus.OK)
  async deleteStaff(
    @CurrentUserId() userId: string,
    @Param('staffId') staffId: string
  ) {
    try {
      console.log(staffId);
      return await this.adminService.deleteUser(userId, staffId);
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }
}
