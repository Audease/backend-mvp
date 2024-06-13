import {
  Body,
  Post,
  Controller,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Logger,
} from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { verifyDto } from '../auth/dto/misc-dto';
import { CollegeVerificationService } from './college-verification.service';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('College Verification')
@Controller('verification')
export class CollegeVerificationController {
  private readonly logger = new Logger(CollegeVerificationService.name);

  constructor(private readonly verification: CollegeVerificationService) {}

  @Post('verify-school')
  @ApiOperation({ summary: 'Verify School'})
  @ApiCreatedResponse({
    description: 'School verified successfully',
  })
  @HttpCode(HttpStatus.OK)
  async verifySchool(@Body() verifyDto: verifyDto) {
    try {
      return await this.verification.verifySchool(verifyDto.keyId);
    } catch (error) {
      this.logger.error(error.message);
      throw new NotFoundException(error.message);
    }
  }

  @Post('verify-key')
  @ApiOperation({ summary: 'Verify Key'})
  @ApiCreatedResponse({
    description: 'Key verified successfully',
  })
  @HttpCode(HttpStatus.OK)
  async verifyKey(@Body() verifyDto: verifyDto) {
    try {
      return await this.verification.verifyKey(verifyDto.keyId);
    } catch (error) {
      this.logger.error(error.message);
      throw new NotFoundException(error.message);
    }
  }
}
