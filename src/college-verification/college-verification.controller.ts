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

@Controller('verification')
export class CollegeVerificationController {
  private readonly logger = new Logger(CollegeVerificationService.name);

  constructor(private readonly verification: CollegeVerificationService) {}

  @Post('verify-school')
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
