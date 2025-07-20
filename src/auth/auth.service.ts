// src/auth/auth.service.ts
import { AuthRepository } from './auth.repository';
import { JwtAuthService } from './jwt.service';
import { RedisService } from '../shared/services/redis.service';
import { MailService } from '../shared/services/mail.service';
import { UserService } from '../users/users.service';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { CreateSchoolDto } from './dto/create-school.dto';
import { ISchoolCreate, SchoolDomainResponse } from './auth.interface';
import { Role } from '../utils/enum/role';
import { v4 as uuid } from 'uuid';
import * as bcrypt from 'bcrypt';
import { DbTransactionFactory } from '../shared/services/transactions/TransactionManager';
import { Users } from '../users/entities/user.entity';
import { sendSlackNotification } from '../utils/helpers/slack.helpers';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UsernameGeneratorService } from '../shared/services/username-generator.service';
import { GCPDNSService } from '../shared/services/gcp-dns.service'; // NEW

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtAuthService,
    private readonly mailService: MailService,
    private readonly userService: UserService,
    private redisService: RedisService,
    private readonly usernameGeneratorService: UsernameGeneratorService,
    private readonly dbTransactionFactory: DbTransactionFactory,
    private readonly gcpDnsService: GCPDNSService // NEW
  ) {}

  get redis() {
    return this.redisService.getClient();
  }

  async createSchool(createSchoolDto: CreateSchoolDto): Promise<ISchoolCreate> {
    let transactionRunner = null;
    let user: Users = null;

    try {
      transactionRunner = await this.dbTransactionFactory.createTransaction();
      await transactionRunner.startTransaction();

      const transactionManager = transactionRunner.transactionManager;
      const { college_name, username, password, email } = createSchoolDto;

      const schoolExists = await this.authRepository.findSchool(college_name);
      if (schoolExists) {
        this.logger.error('School already exists');
        throw new ConflictException('School already exists');
      }

      // NEW: Generate subdomain
      const subdomain = this.generateSubdomain(college_name);

      // NEW: Check if subdomain already exists
      const existingSubdomain =
        await this.authRepository.findSchoolBySubdomain(subdomain);
      if (existingSubdomain) {
        throw new ConflictException('School subdomain already exists');
      }

      const customDomain = `${subdomain}.${process.env.BASE_DOMAIN}`;

      const onboardingKey = uuid();
      const role = await this.userService.getRoleByName(Role.SCHOOL_ADMIN);

      const cleanedUsername =
        this.usernameGeneratorService.cleanAndTruncateText(
          createSchoolDto.username,
          50
        );

      const userExists =
        await this.userService.getUserByUsername(cleanedUsername);
      if (userExists) {
        this.logger.error('Username already exists');
        throw new ConflictException('Username already exists');
      }

      const emailExists = await this.userService.getUserByEmail(email);
      if (emailExists) {
        this.logger.error('Email already exists');
        throw new ConflictException('Email already exists');
      }

      // NEW: Create school with domain info
      const schoolData = {
        ...createSchoolDto,
        subdomain,
        custom_domain: customDomain,
        domain_verified: false,
        domain_configured_at: new Date(),
      };

      const data = await this.userService.createTransaction(
        schoolData,
        transactionManager
      );

      user = await this.userService.createUserTransaction(
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
        transactionManager
      );

      await this.redis.hset(
        'onboarding',
        onboardingKey,
        JSON.stringify({
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          college_id: data.id,
          subdomain, // NEW
          customDomain, // NEW
        })
      );

      // NEW: Configure DNS record
      try {
        const dnsConfigured =
          await this.gcpDnsService.createSubdomainRecord(subdomain);
        if (dnsConfigured) {
          // Mark domain as verified after successful DNS configuration
          await this.authRepository.verifySchoolDomain(data.id);
          this.logger.log(`DNS configured for ${customDomain}`);
        }
      } catch (dnsError) {
        this.logger.warn(
          `DNS configuration failed for ${customDomain}: ${dnsError.message}`
        );
        // Continue without failing the school creation
      }

      const login_url = `${process.env.FRONTEND_URL}/signIn`;

      sendSlackNotification(
        `A *school just created an account* with the following details, *School*: ${data.college_name} \n *located_at*: ${data.address_line1} \n *county*: ${data.county}, *country* : ${data.country} \n *subdomain*: ${subdomain} \n *customDomain*: ${customDomain} \n *onboardingKey*: ${onboardingKey}`
      );

      this.mailService.sendTemplateMail(
        {
          to: user.email,
          subject: 'Welcome to Audease',
        },
        'school-onboarding',
        {
          username: user.username,
          first_name: user.first_name,
          login_url,
          custom_domain: customDomain, // NEW
        }
      );

      await transactionRunner.commitTransaction();

      return {
        message:
          'School created successfully check your mail for further instructions',
        keyId: onboardingKey,
        subdomain, // NEW
        customDomain, // NEW
      };
    } catch (error) {
      this.logger.error(`Failed to create school: ${error.message}`);
      if (transactionRunner) await transactionRunner.rollbackTransaction();
      throw new ConflictException(`Failed to create school: ${error.message}`);
    } finally {
      if (transactionRunner) await transactionRunner.releaseTransaction();
    }
  }

  // NEW: Generate subdomain from college name
  private generateSubdomain(collegeName: string): string {
    return collegeName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 30);
  }

  // UPDATED: Login with subdomain support
  async login(data: {
    username: string;
    password: string;
    deviceToken?: string;
    subdomain?: string;
    isBaseDomain?: boolean;
  }) {
    const { username, password, subdomain, isBaseDomain } = data;

    let user: Users;

    if (isBaseDomain) {
      // Base domain login - find user and check if they should be redirected
      user = await this.userService.getUserByUsername(username);

      if (!user) {
        throw new NotFoundException('Invalid username or password');
      }

      // Check if user's school has a verified custom domain
      if (user.school?.subdomain && user.school?.domain_verified) {
        return {
          requiresRedirect: true,
          redirectUrl: `https://${user.school.subdomain}.${process.env.BASE_DOMAIN}`,
          message: 'Please use your school-specific domain to log in',
          schoolName: user.school.college_name,
          subdomain: user.school.subdomain,
        };
      }
    } else if (subdomain) {
      // Subdomain login - find user within specific school
      const school = await this.authRepository.findSchoolBySubdomain(subdomain);
      if (!school) {
        throw new NotFoundException('School not found');
      }

      user = await this.userService.getUserByUsernameAndSchool(
        username,
        school.id
      );
    } else {
      // Fallback for other domains
      user = await this.userService.getUserByUsername(username);
    }

    if (!user || !user.password || !user.id) {
      this.logger.error('Invalid username or password');
      throw new NotFoundException('Invalid username or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      this.logger.error('Invalid password');
      throw new NotFoundException('Invalid username or password');
    }

    if (user.expiration_date && user.expiration_date < new Date()) {
      throw new UnauthorizedException('Account has expired');
    }

    // Rate limit login attempts
    const attempts = await this.redis.get(`login_attempts:${username}`);
    if (attempts && parseInt(attempts) > 5) {
      throw new UnauthorizedException(
        'Too many login attempts. Please try again in 15 minutes'
      );
    }

    if (user['2fa_required'] === true) {
      // 2FA handling code...
    }

    const role = await this.userService.getUserRoleById(user.id);
    const token = await this.jwtService.generateAuthTokens(user.id, role.id);

    // Update last login time
    await this.userService.update(user.id, {
      last_login_at: new Date(),
    });

    // Get permissions
    const permission = await this.userService.getRolePermission(role.id);
    const permission_id = permission.rolePermission.map(p => p.permission.id);
    const result = await this.userService.getPermissionsByIds(permission_id);

    // Reset login attempts on successful login
    await this.redis.del(`login_attempts:${username}`);

    // Check if user is a student to return learner ID
    const student = await this.authRepository.findStudentByEmail(user.email);

    // Return appropriate response based on role
    if (permission.role === Role.STUDENT) {
      return {
        token,
        permissions: result.map(p => p.name),
        user_id: user.id,
        learner_id: student?.id || null,
        email: user.email,
        name: student?.name || `${user.first_name} ${user.last_name}`,
        requires_password_change: !user.is_password_changed,
        last_login_at: user.last_login_at,
        school_domain: user.school?.custom_domain, // NEW
      };
    } else {
      return {
        token,
        permissions: result.map(p => p.name),
        user_id: user.id,
        email: user.email,
        name: `${user.first_name} ${user.last_name}`,
        requires_password_change: !user.is_password_changed,
        last_login_at: user.last_login_at,
        school_domain: user.school?.custom_domain, // NEW
      };
    }
  }

  // NEW: Find user's school domain
  async findUserSchool(identifier: string): Promise<SchoolDomainResponse> {
    // Try to find user by username or email
    let user = await this.userService.getUserByUsername(identifier);
    if (!user) {
      user = await this.userService.getUserByEmail(identifier);
    }

    if (!user || !user.school) {
      throw new NotFoundException('User not found');
    }

    if (user.school.subdomain && user.school.domain_verified) {
      return {
        found: true,
        schoolName: user.school.college_name,
        subdomain: user.school.subdomain,
        redirectUrl: `https://${user.school.subdomain}.${process.env.BASE_DOMAIN}`,
        hasCustomDomain: true,
      };
    }

    return {
      found: true,
      schoolName: user.school.college_name,
      hasCustomDomain: false,
      message: 'School does not have a custom domain configured',
    };
  }

  // ... rest of existing methods (send2faEmail, verify2fa, refreshToken, etc.)
  async send2faEmail(email: string) {
    const user = await this.userService.getUserByEmail(email);

    if (!user) {
      this.logger.error('Invalid email');
      throw new NotFoundException('Invalid email');
    }

    const code = Math.floor(100000 + Math.random() * 900000);
    await this.redis.set(`2fa:${user.id}`, code, 'EX', 300);

    await this.mailService.sendTemplateMail(
      {
        to: email,
        subject: 'Two Factor Authentication Code',
      },
      'email-otp',
      {
        code,
        first_name: user.first_name,
      }
    );
  }

  async verify2fa(data: { email: string; code: number; rememberMe?: boolean }) {
    const { email, code } = data;

    const user = await this.userService.getUserByEmail(email);
    if (!user) {
      this.logger.error('Invalid email');
      throw new NotFoundException('Invalid email');
    }

    const storedCode = await this.redis.get(`2fa:${user.id}`);
    if (!storedCode) {
      this.logger.error('Invalid code');
      throw new NotFoundException('Invalid code');
    }

    if (storedCode !== code.toString()) {
      this.logger.error('Invalid code');
      throw new NotFoundException('Invalid code');
    }

    if (data.rememberMe == true) {
      const deviceToken = crypto.randomBytes(30).toString('hex');
      await this.redis.set(
        `device_token:${user.id}:${deviceToken}`,
        'true',
        'EX',
        2592000
      );

      const role = await this.userService.getUserRoleById(user.id);
      const token = await this.jwtService.generateAuthTokens(user.id, role.id);

      return {
        token,
        deviceToken,
      };
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
      role.id
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

    await this.redis.set(resetKey, user.id, 'EX', 86400);

    const name = user.first_name;

    await this.mailService.sendTemplateMail(
      {
        to: email,
        subject: 'Password Reset',
      },
      'password-reset',
      {
        first_name: name,
        resetUrl,
      }
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

    await this.redis.del(token);

    return {
      message: 'Password reset successfully',
    };
  }

  async enable2fa(userId: string) {
    const user = await this.userService.findOne(userId);
    if (!user) {
      this.logger.error('Invalid user');
      throw new NotFoundException('Invalid user');
    }

    await this.userService.update(user.id, { '2fa_required': true });

    return {
      message: '2fa enabled successfully',
    };
  }

  async disable2fa(userId: string) {
    const user = await this.userService.findOne(userId);
    if (!user) {
      this.logger.error('Invalid user');
      throw new NotFoundException('Invalid user');
    }

    await this.userService.update(user.id, { '2fa_required': false });

    return {
      message: '2fa disabled successfully',
    };
  }

  async changePassword(
    userId: string,
    data: ChangePasswordDto
  ): Promise<{ message: string }> {
    const { currentPassword, newPassword } = data;

    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    if (currentPassword === newPassword) {
      throw new BadRequestException(
        'New password must be different from current password'
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.userService.update(userId, {
      password: hashedPassword,
      is_password_changed: true,
    });

    return { message: 'Password changed successfully' };
  }
}
