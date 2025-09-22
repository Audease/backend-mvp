import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Logger,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { RecruiterService } from './recruiter.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Permissions } from '../shared/decorators/permission.decorator';
import { Permission } from '../utils/enum/permission';
import { CurrentUserId } from '../shared/decorators/get-current-user-id.decorator';
import { CreateLearnerDto } from './dto/create-learner.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { PaginationParamsDto } from './dto/pagination-params.dto';
import { UpdateLearnerDto } from './dto/update-learner.dto';
import { FilterStudentsDto } from './dto/filter-params.dto';

@ApiTags('Recruiter Dashboard')
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('recruitment')
export class RecruiterController {
  private readonly logger = new Logger(RecruiterController.name);

  constructor(private readonly recruiterService: RecruiterService) {}

  @Post('/create')
  @Permissions(Permission.ADD_STUDENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Learner on the recruiter dashboard' })
  @ApiCreatedResponse({
    description: 'Learner created successfully',
  })
  @ApiConflictResponse({ description: 'Email or mobile number already exist' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiNotFoundResponse({ description: 'Recruiter not found for the user' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @HttpCode(HttpStatus.CREATED)
  async createLearner(
    @CurrentUserId() userId: string,
    @Body() createLearnerDto: CreateLearnerDto
  ) {
    try {
      return await this.recruiterService.createLearner(
        userId,
        createLearnerDto
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

  // src/recruiter/recruiter.controller.ts - Update upload endpoint

  @Post('/upload')
  @Permissions(Permission.ADD_STUDENT)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'CSV file upload for bulk learner creation',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'CSV file containing learner data',
        },
      },
      required: ['file'],
    },
  })
  @ApiOperation({
    summary: 'Import learners from CSV file',
    description: `
    Import multiple learners from a CSV file. The CSV should contain learner information with flexible column headers.
    
    **Required Fields:**
    - name (or variations: full_name, student_name, learner_name)
    - email (or variations: email_address, e_mail, student_email)
    
    **Optional Fields:**
    - date_of_birth (or variations: dob, birth_date, birthdate)
    - mobile_number (or variations: phone, mobile, contact_number)
    - NI_number (or variations: national_insurance, ni)
    - passport_number (or variations: passport, passport_no)
    - home_address (or variations: address, residential_address)
    - funding (or variations: funding_type, sponsor)
    - level (or variations: course_level, study_level)
    - awarding (or variations: awarding_body, certification_body)
    - chosen_course (or variations: course, course_name, program)
    
    The system will automatically map column headers to the appropriate fields.
  `,
  })
  @ApiResponse({
    status: 201,
    description: 'Learners imported successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Successfully imported 5 learners',
        },
        summary: {
          type: 'object',
          properties: {
            totalProcessed: { type: 'number', example: 6 },
            imported: { type: 'number', example: 5 },
            errors: { type: 'number', example: 1 },
          },
        },
        importedLearners: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              email: { type: 'string' },
            },
          },
        },
        errorDetails: {
          type: 'object',
          properties: {
            errorReport: { type: 'string' },
            errors: { type: 'array' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation errors or file issues',
    schema: {
      type: 'object',
      properties: {
        error: {
          type: 'string',
          enum: [
            'FILE_MISSING',
            'INVALID_FILE_TYPE',
            'FILE_TOO_LARGE',
            'CSV_PARSE_ERROR',
            'EMPTY_CSV',
            'NO_VALID_RECORDS',
            'ALL_DUPLICATES',
          ],
          example: 'NO_VALID_RECORDS',
        },
        message: { type: 'string', example: 'No valid records found in CSV' },
        details: {
          type: 'string',
          example: 'All records in the CSV file have validation errors',
        },
        errorReport: { type: 'string' },
        errors: { type: 'array' },
      },
    },
  })
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @CurrentUserId() userId: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    try {
      return await this.recruiterService.importLearners(userId, file);
    } catch (error) {
      this.logger.error(`File upload error: ${error.message}`, error.stack);

      // Re-throw BadRequestException with structured error
      if (error instanceof BadRequestException) {
        throw error;
      }

      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }

      if (error instanceof ConflictException) {
        throw new HttpException(error.message, HttpStatus.CONFLICT);
      }

      // Generic error for unexpected issues
      throw new HttpException(
        {
          error: 'UNEXPECTED_ERROR',
          message: 'An unexpected error occurred during file processing',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('/students')
  @Permissions(Permission.ADD_STUDENT)
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
    summary: 'View information of all students on the recruiter dashboard',
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiNotFoundResponse({ description: 'Recruiter not found for the user' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @HttpCode(HttpStatus.OK)
  async findAll(
    @CurrentUserId() userId: string,
    @Query() paginationParams: PaginationParamsDto
  ) {
    try {
      return await this.recruiterService.getAllStudents(
        userId,
        paginationParams
      );
    } catch (error) {
      this.logger.error(error.message, error.stack);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('students/filters')
  @Permissions(Permission.ADD_STUDENT)
  @ApiBearerAuth()
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
    summary:
      'Filter students based on funding and chosen course on the recruiter dashboard',
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiNotFoundResponse({ description: 'Recruiter not found for the user' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @HttpCode(HttpStatus.OK)
  async filter(
    @CurrentUserId() userId: string,
    @Query() filterParams: FilterStudentsDto
  ) {
    try {
      return await this.recruiterService.getFilteredStudents(
        userId,
        filterParams
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

  @Get('/students/:studentId')
  @Permissions(Permission.ADD_STUDENT)
  @ApiBearerAuth()
  @ApiParam({
    name: 'studentId',
    type: String,
    description: 'ID of the student',
  })
  @ApiOperation({
    summary: 'View information of a student on the recruiter dashboard',
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiNotFoundResponse({ description: 'Recruiter not found for the user' })
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
      return await this.recruiterService.getStudent(userId, studentId);
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

  @Patch('/students/:studentId')
  @Permissions(Permission.ADD_STUDENT)
  @ApiBearerAuth()
  @ApiParam({
    name: 'studentId',
    type: String,
    description: 'ID of the student',
  })
  @ApiOperation({
    summary: 'Update/Edit information of a student on the recruiter dashboard',
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiNotFoundResponse({ description: 'Recruiter not found for the user' })
  @ApiNotFoundResponse({
    description: 'Student with studentId not found for the user',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @HttpCode(HttpStatus.OK)
  async update(
    @CurrentUserId() userId: string,
    @Param('studentId') studentId: string,
    @Body() updateLearnerDto: UpdateLearnerDto
  ) {
    try {
      return await this.recruiterService.editInformation(
        userId,
        studentId,
        updateLearnerDto
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

  @Delete('/students/:studentId')
  @Permissions(Permission.ADD_STUDENT)
  @ApiBearerAuth()
  @ApiParam({
    name: 'studentId',
    type: String,
    description: 'ID of the student',
  })
  @ApiOperation({
    summary: 'Delete information of a student on the recruiter dashboard',
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiNotFoundResponse({ description: 'Recruiter not found for the user' })
  @ApiNotFoundResponse({
    description: 'Student with studentId not found for the user',
  })
  @ApiNotFoundResponse({
    description: 'Student could not be deleted',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUserId() userId: string,
    @Param('studentId') studentId: string
  ) {
    try {
      return await this.recruiterService.deleteStudent(userId, studentId);
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
