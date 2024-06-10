import { AuthRepository } from './auth.repository';
import { JwtAuthService } from './jwt.service';
import { RedisService } from '../shared/services/redis.service';
import { MailService } from '../shared/services/mail.service';
import { UserService } from '../users/users.service';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { CreateSchoolDto } from './dto/create-school.dto';
import { ISchoolCreate, IUserCreate } from './auth.interface';
import { Role } from '../utils/enum/role';
import { v4 as uuid } from 'uuid';
import { RegistrationStatus } from '../utils/enum/registration_status';
import * as bcrypt from 'bcrypt';
import { DbTransactionFactory } from '../shared/services/transactions/TransactionManager';
import { Users } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtAuthService,
    private readonly mailService: MailService,
    private readonly userService: UserService,
    private redisService: RedisService,
    private readonly dbTransactionFactory: DbTransactionFactory,
  ) {}

  get redis() {
    return this.redisService.getClient();
  }

  async createSchool(createSchoolDto: CreateSchoolDto): Promise<ISchoolCreate> {
   let transactionRunner = null;
   let user : Users = null;

   try {
    transactionRunner = await this.dbTransactionFactory.createTransaction();
    await transactionRunner.startTransaction();

    const transactionManager = transactionRunner.transactionManager
    const {
      college_name,
      username,
      password,
    } = createSchoolDto;

    const schoolExists = await this.authRepository.findSchool(college_name);

    if (schoolExists) {
      this.logger.error('School already exists');
      throw new ConflictException('School already exists');
    }

    const onboardingKey = uuid();


    const role = await this.userService.getRoleByName(Role.SCHOOL_ADMIN);

    const userExists = await this.userService.getUserByUsername(username);

    if (userExists) {
      this.logger.error('Username already exists');
      throw new ConflictException('Username already exists');
    }

    const data = await this.userService.createTransaction(createSchoolDto, transactionManager);    


    user = await this.userService.createUserWithCollegeId(
      {
        username,
        password: await bcrypt.hash(password, 10),
        email: createSchoolDto.email,
        phone: createSchoolDto.phone,
        first_name: createSchoolDto.first_name,
        last_name: createSchoolDto.last_name,
        role,
      },
    data.id,
    );
    await this.redis.hset(
      'onboarding',
      onboardingKey,
      JSON.stringify({
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        college_id: data.id,
      }),
    );
    await transactionRunner.commitTransaction();
    return {
      message: 'School created successfully',
      keyId: onboardingKey,
    }
   } catch (error) {
    this.logger.error(`Failed to create school: ${error.message}`);
    if (transactionRunner) await transactionRunner.rollbackTransaction();
    await this.userService.delete(user.id)
    throw new ConflictException('Failed to create school');
   }
   finally {
    if (transactionRunner) await transactionRunner.rollbackTransaction();
   }
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

  async createUser(data: IUserCreate) {
    const { username, password, keyId } = data;

    const onboardingData = await this.redis.hget('onboarding', keyId);

    if (!onboardingData) {
      this.logger.error('Invalid key');
      throw new NotFoundException('Invalid key');
    }

    const { email, first_name, last_name, college_id, phone } =
      JSON.parse(onboardingData);

    const role = await this.userService.getRoleByName(Role.SCHOOL_ADMIN);

    const userExists = await this.userService.getUserByUsername(username);

    if (userExists) {
      this.logger.error('Username already exists');
      throw new ConflictException('Username already exists');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const user = await this.userService.createUserWithCollegeId(
      {
        username,
        password: await bcrypt.hash(password, 10),
        email,
        phone,
        first_name,
        last_name,
        role,
      },
      college_id,
    );

    // Remove the onboarding key from redis
    await this.redis.hdel('onboarding', keyId);

    return {
      message: 'User created successfully',
    };
  }

  async login(data: { username: string; password: string }) {
    const { username, password } = data;

    const user = await this.userService.getUserByUsername(username);

    if (!user) {
      this.logger.error('Invalid username');
      throw new NotFoundException('Invalid username or password');
    }

    if (!user.password) {
      this.logger.error('Invalid password');
      throw new NotFoundException('Invalid username or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      this.logger.error('Invalid password');
      throw new NotFoundException('Invalid username or password');
    }

    // Add a null check for user.id
    if (!user.id) {
      this.logger.error('Invalid user');
      throw new NotFoundException('Invalid user');
    }

    const role = await this.userService.getUserRoleById(user.id);

    const token = await this.jwtService.generateAuthTokens(user.id, role.id);

    return {
      token,
    };
  }

  async refreshToken(token: string) {
    const payload = await this.jwtService.verifyRefreshToken(token);

    const user = await this.userService.findOne(payload.sub);

    if (!user) {
      this.logger.error('Invalid user');
      throw new NotFoundException('Invalid user');
    }

    const role = await this.userService.getUserRoleById(user.id);

    const newToken = await this.jwtService.generateAccessToken(
      user.id,
      role.id,
    );

    return {
      token: newToken,
    };
  }

  async initiatePasswordReset(email: string) {
    const user = await this.userService.getUserByEmail(email);

    if (!user) {
      this.logger.error('Invalid email');
      throw new NotFoundException('Invalid email');
    }

    const resetKey = crypto.randomBytes(30).toString('hex');

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetKey}`;

    // Store the key on redis for 24 hours
    await this.redis.set(resetKey, user.id, 'EX', 86400);

    await this.mailService.sendTemplateMail(
      {
        to: email,
        subject: 'Password Reset',
      },
      'password-reset',
      {
        resetUrl,
      },
    );

    return {
      message:
        'Password reset initiated check your mail for further instructions',
    };
  }

  async resetPassword(data: { token: string; password: string }) {
    const { token, password } = data;

    const userId = await this.redis.get(token);

    if (!userId) {
      this.logger.error('Invalid token');
      throw new NotFoundException('Invalid token');
    }

    const user = await this.userService.findOne(userId);

    if (!user) {
      this.logger.error('Invalid user');
      throw new NotFoundException('Invalid user');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await this.userService.update(user.id, { password: hashedPassword });

    // Remove the key from redis
    await this.redis.del(token);

    return {
      message: 'Password reset successfully',
    };
  }
}
