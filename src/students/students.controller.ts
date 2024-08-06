import {
  Post,
  Get,
  UseGuards,
  Logger,
  Body,
  HttpStatus,
  InternalServerErrorException,
  Controller,
} from '@nestjs/common';
import { StudentsService } from './students.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../shared/decorators/roles.decorator';
import { CurrentUserId } from '../shared/decorators/get-current-user-id.decorator';
import {
  ApiTags,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiOperation,
} from '@nestjs/swagger';
import { Role } from '../utils/enum/role';
import { UpdateStudentDto } from './dto/update-student.dto';

@ApiTags('Students')
@UseGuards(JwtAuthGuard)
@Controller('students')
export class StudentsController {
  private readonly logger = new Logger(StudentsController.name);

  constructor(private readonly studentsService: StudentsService) {}

  @Get('/profile')
  @Roles(Role.SCHOOL_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a logged in student profile' })
  async getStudentProfile(@CurrentUserId() userId: string) {
    return this.studentsService.getStudentById(userId);
  }

  //  Update a student's profile
  @Post('/profile')
  @Roles(Role.SCHOOL_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a student profile' })
  @ApiConsumes('application/json')
  @ApiBody({ type: UpdateStudentDto })
  async updateStudentProfile(
    @CurrentUserId() userId: string,
    @Body() student: UpdateStudentDto
  ) {
    try {
      return this.studentsService.updateStudentById(userId, student);
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'An error occurred while updating student profile',
      });
    }
  }

  //  Save a student's document
  @Post('/document')
  @Roles(Role.STUDENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Save a student document' })
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
  @ApiOperation({ summary: 'Save a student document' })
  async saveDocument(
    @CurrentUserId() userId: string,
    @Body() file: Express.Multer.File
  ) {
    return this.studentsService.saveDocument(userId, file);
  }
}
