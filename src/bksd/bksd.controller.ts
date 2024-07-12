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
} from '@nestjs/common';
import { BksdService } from './bksd.service';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/role.guard';
import { Roles } from '../shared/decorators/roles.decorator';
import { Role } from '../utils/enum/role';
import { CurrentUserId } from '../shared/decorators/get-current-user-id.decorator';

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
  @ApiNotFoundResponse({ description: 'Learnernot found for the user' })
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
}
