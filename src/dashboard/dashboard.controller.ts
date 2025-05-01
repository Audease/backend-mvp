import { Controller } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUserId } from '../shared/decorators/get-current-user-id.decorator';
import {
  Get,
  Post,
  Query,
  HttpCode,
  Body,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { Permission } from '../utils/enum/permission';
import { Permissions } from '../shared/decorators/permission.decorator';
import { UpdateLearnerDto } from './dto/update-learner.dto';
import { UseGuards } from '@nestjs/common';

@ApiBearerAuth()
@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  // @Get('recruiters')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard, PermissionGuard)
  // @Permissions(Permission.ADD_STUDENT)
  // async findRecruiters(
  //   @CurrentUserId() userId: string,
  //   @Query('page') page: number,
  //   @Query('limit') limit: number
  // ) {
  //   return this.dashboardService.findRecruiters(userId, page, limit);
  // }

  @Get('bksds')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(Permission.APPLICATION)
  async findBKSDDs(
    @CurrentUserId() userId: string,
    @Query('page') page: number,
    @Query('limit') limit: number
  ) {
    return this.dashboardService.findBKSDDs(userId, page, limit);
  }

  @Get('accessors')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(Permission.APPROVAL)
  async findAccessors(
    @CurrentUserId() userId: string,
    @Query('page') page: number,
    @Query('limit') limit: number
  ) {
    return this.dashboardService.findAccessors(userId, page, limit);
  }

  @Get('inductors')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(Permission.INDUCTION)
  async findInductors(
    @CurrentUserId() userId: string,
    @Query('page') page: number,
    @Query('limit') limit: number
  ) {
    return this.dashboardService.findInductors(userId, page, limit);
  }

  @Post('learner/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(Permission.ADD_STUDENT)
  async updateLearner(
    @Param('id') learnerId: string,
    @Body() updateLearnerDto: UpdateLearnerDto
  ) {
    return this.dashboardService.updateLearner(learnerId, updateLearnerDto);
  }

  @Post('move-student/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(Permission.ADD_STUDENT)
  async moveStudent(@Param('id') learnerId: string) {
    return this.dashboardService.moveStudent(learnerId);
  }

  @Post('move-student-to-accessor/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(Permission.APPLICATION)
  async moveStudentToAccessor(@Param('id') learnerId: string) {
    return this.dashboardService.moveStudentToAccessor(learnerId);
  }

  @Post('move-student-to-inductor/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(Permission.APPROVAL)
  async moveStudentToInductor(@Param('id') learnerId: string) {
    return this.dashboardService.moveStudentToInductor(learnerId);
  }
}
