import { AuthRepository } from './auth.repository';
import { JwtAuthService } from './jwt.service';
import { Redis } from 'ioredis';
import { MailService } from '../shared/services/mail.service';
import { UserService } from '../users/users.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { CreateSchoolDto } from './dto/create-school.dto';
import { ISchoolCreate } from './auth.interface';
import { v4 as uuid} from 'uuid'
import { RegistrationStatus } from '../utils/enum/registration_status';


@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtAuthService,
    private readonly mailService: MailService,
    private readonly userService: UserService,
    private readonly redis: Redis,
    private readonly logger = new Logger(AuthService.name),
  ) {}

  async createSchool(createSchoolDto: CreateSchoolDto): Promise<ISchoolCreate> {
    const {
      first_name,
      last_name,
      email,
      address_line1,
      address_line2,
      business_code,
      city,
      college_name,
      country,
      no_of_employee,
      post_code,
      state,
    } = createSchoolDto;

    const data = await this.authRepository.create({
      college_name,
      state,
      address_line1,
      address_line2,
      business_code,
      city,
      country,
      no_of_employee,
      post_code,
    });      

    let onboardingKey = uuid()

    await this.redis.hset(
      'onboarding',
      onboardingKey,
      JSON.stringify({
        email,
        first_name,
        last_name,
        college_id: data.id,
      }),
    );

    await this.mailService.sendTemplateMail({
      to: email,
      subject: "Welcome to Audease",
    },
    "school-onboarding",
    {
      first_name,
      last_name,
      college_name,
      onboardingKey,
    }
  )

    return {
      message:
        'School created successfully check your mail for further instructions',
      keyId: onboardingKey,
    };
  }

  async verifySchool(key: string) {
    const data = await this.redis.hget('onboarding', key);

    if (!data) {
      this.logger.error('Invalid key');
      throw new NotFoundException('Invalid key');
    }

    const { email, first_name, last_name, college_id } = JSON.parse(data);

    const school = await this.authRepository.updateStatus(college_id, RegistrationStatus.VERIFIED);

    const school_name = school.college_name

    await this.mailService.sendTemplateMail({
      to: email,
      subject: 'School Verification Successful',
    },
    'sucessful-verification',
    {
      first_name,
      last_name,
      school_name,
    }
  );
}
  
}
