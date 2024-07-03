import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Logger,
  Post,
  UseGuards,
} from '@nestjs/common';
import { RecruiterService } from './recruiter.service';
import { Role } from '../utils/enum/role';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../shared/decorators/roles.decorator';
import { CurrentUserId } from '../shared/decorators/get-current-user-id.decorator';
import { CreateLearnerDto } from './dto/create-learner.dto';

@ApiTags('Recruiter')
@UseGuards(JwtAuthGuard)
@Controller('recruiter')
export class RecruiterController {
  private readonly logger = new Logger(RecruiterController.name);

  constructor(private readonly recruiterService: RecruiterService) {}

  @Post('/create')
  @Roles(Role.SCHOOL_RECRUITER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Learner' })
  @ApiCreatedResponse({
    description: 'Learner created successfully',
  })
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
      this.logger.error(error.message, error.stack);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  //   @Post(':userId/upload')
  //   @UseInterceptors(FileInterceptor('file'))
  //   async uploadFile(
  //     @Param('userId', ParseUUIDPipe) userId: string,
  //     @UploadedFile() file: Express.Multer.File
  //   ) {

  // }
}
