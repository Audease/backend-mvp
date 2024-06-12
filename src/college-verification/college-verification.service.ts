import { Logger, Injectable, NotFoundException } from '@nestjs/common';
import { MailService } from '../shared/services/mail.service';
import { AuthRepository } from '../auth/auth.repository';
import { RedisService } from '../shared/services/redis.service';
import { RegistrationStatus } from '../utils/enum/registration_status';

@Injectable()
export class CollegeVerificationService {
  private readonly logger = new Logger(CollegeVerificationService.name);
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly mailService: MailService,
    private redisService: RedisService,
  ) {}

  get redis() {
    return this.redisService.getClient();
  }

  async verifySchool(key: string) {
    const data = await this.redis.hget('onboarding', key);

    if (!data) {
      this.logger.error('Invalid key');
      throw new NotFoundException('Invalid key');
    }

    const { email, first_name, last_name, college_id } = JSON.parse(data);

    const school = await this.authRepository.updateStatus(
      college_id,
      RegistrationStatus.VERIFIED,
    );

    const verifyUrl = `${process.env.FRONTEND_URL}/verify?token=${key}`;

    const school_name = school.college_name;

    await this.mailService.sendTemplateMail(
      {
        to: email,
        subject: 'School Verification Successful',
      },
      'sucessful-verification',
      {
        first_name,
        last_name,
        school_name,
        verifyUrl,
      },
    );
    return {
      message: 'School verified successfully',
    };
  }

  async verifyKey(key: string) {
    const data = await this.redis.hget('onboarding', key);

    if (!data) {
      this.logger.error('Invalid key');
      throw new NotFoundException('Invalid key');
    }

    return {
      message: 'Key verified successfully',
    };
  }
}
