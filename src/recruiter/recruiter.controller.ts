// import {
//   Body,
//   Controller,
//   HttpCode,
//   HttpException,
//   HttpStatus,
//   Logger,
//   Post,
//   UseGuards,
// } from '@nestjs/common';
// import { RecruiterService } from './recruiter.service';
// import {
//   ApiBearerAuth,
//   ApiCreatedResponse,
//   ApiOperation,
//   ApiTags,
//   ApiUnauthorizedResponse,
// } from '@nestjs/swagger';
// import { JwtAuthGuard } from '../auth/jwt-auth.guard';
// import { GetCurrentUserId } from '../shared/decorators/get-current-user-id.decorator';
// import { CreateLearnerDto } from './dto/create-learner.dto';
// import { RoleGuard } from '../auth/role.guard';
// import { Roles } from '../shared/decorators/roles.decorator';
// import { Role } from '../utils/enum/role';

// @ApiTags('Recruiter')
// @Controller('recruiter')
// @UseGuards(JwtAuthGuard, RoleGuard)
// export class RecruiterController {
//   private readonly logger = new Logger(RecruiterController.name);

//   constructor(private readonly recruiterService: RecruiterService) {}

//   @Post('/create')
//   @ApiBearerAuth()
//   @ApiOperation({ summary: 'Create Learner' })
//   @ApiCreatedResponse({
//     description: 'Learner created successfully',
//   })
//   @ApiUnauthorizedResponse({
//     description: 'Unauthorized',
//   })
//   @Roles(Role.SCHOOL_RECRUITER)
//   @HttpCode(HttpStatus.CREATED)
//   async createLearner(
//     @GetCurrentUserId() userId: string,
//     @Body() createLearnerDto: CreateLearnerDto
//   ) {
//     try {
//       return await this.recruiterService.createLearner(
//         userId,
//         createLearnerDto
//       );
//     } catch (error) {
//       this.logger.error(error.message, error.stack);
//       throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
//     }
//   }
// }

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
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetCurrentUserId } from '../shared/decorators/get-current-user-id.decorator';
import { CreateLearnerDto } from './dto/create-learner.dto';


@ApiTags('Recruiter')
@Controller('recruiter')

export class RecruiterController {
  private readonly logger = new Logger(RecruiterController.name);

  constructor(private readonly recruiterService: RecruiterService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/create')
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
    @GetCurrentUserId() userId: string,
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
  };
//   @Post(':userId/upload')
//   @UseInterceptors(FileInterceptor('file'))
//   async uploadFile(
//     @Param('userId', ParseUUIDPipe) userId: string,
//     @UploadedFile() file: Express.Multer.File
//   ) {
   
  
// }
  }