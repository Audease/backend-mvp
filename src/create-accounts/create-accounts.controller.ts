import {
  Controller,
  Post,
  Body,
  Logger,
  UseGuards,
  HttpStatus,
  HttpCode,
  HttpException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateAccountsService } from './create-accounts.service';
import { GetCurrentUserId } from '../shared/decorators/get-current-user-id.decorator';
import { CreateAccountDto } from './dto/create-create-account.dto';

@Controller('create-account')
export class CreateAccountsController {
  private readonly logger = new Logger(CreateAccountsController.name);
  constructor(private readonly createAccountsService: CreateAccountsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/recruiter')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @GetCurrentUserId() userId: string,
    @Body() createUserDto: CreateAccountDto,
  ) {
    try {
      return await this.createAccountsService.addRecruiter(
        userId,
        createUserDto,
      );
    } catch (error) {
      this.logger.error(error.message);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
