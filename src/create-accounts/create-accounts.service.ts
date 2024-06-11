import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateAccountDto } from './dto/create-create-account.dto';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { AccountRepository } from './account.repository';
import { UserService } from '../users/users.service';
import { Role } from '../utils/enum/role';
import { InjectRepository } from '@nestjs/typeorm';
import { Recruiter } from '../recruiter/entities/recruiter.entity';
import { Repository } from 'typeorm';
import { MailService } from '../shared/services/mail.service';

@Injectable()
export class CreateAccountsService {
  private readonly logger = new Logger(CreateAccountsService.name);
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly userService: UserService,
    private readonly mailService: MailService,
    @InjectRepository(Recruiter)
    private readonly recruiterRepository: Repository<Recruiter>,
  ) {}

  async addRecruiter(userId: string, createUserDto: CreateAccountDto) {
    const admin = await this.accountRepository.findAdmin(userId);
    if (!admin) {
      this.logger.error('User not found');
      throw new NotFoundException('User not found');
    }

    const college_name = admin.school.college_name;
    const college_id = admin.school.id;
    const sanitizedCollegeName = college_name.replace(/\s+/g, '').toLowerCase();
    let generated_username =
      `${createUserDto.first_name}_${createUserDto.last_name}.${sanitizedCollegeName}.recruiter`.toLowerCase();
    const generated_password = crypto
      .randomBytes(12)
      .toString('hex')
      .slice(0, 7);

    const role = await this.userService.getRoleByName(Role.SCHOOL_RECRUITER);

    const userExists =
      await this.userService.getUserByUsername(generated_username);

    if (userExists) {
      const randomNumber = Math.floor(Math.random() * 1000);
      generated_username =
        `${createUserDto.first_name}_${createUserDto.last_name}${randomNumber}.${sanitizedCollegeName}.recruiter`.toLowerCase();
    }

    const emailExists = await this.userService.getUserByEmail(
      createUserDto.email,
    );
    if (emailExists) {
      this.logger.error('Email already exists');
      throw new ConflictException('Email already exists');
    }
    const user = await this.userService.createUserWithCollegeId(
      {
        username: generated_username,
        password: await bcrypt.hashSync(generated_password, 10),
        email: createUserDto.email,
        phone: createUserDto.phone,
        first_name: createUserDto.first_name,
        last_name: createUserDto.last_name,
        role,
      },
      college_id,
    );

    const recruiter = this.recruiterRepository.create({
      ...createUserDto,
      user,
      school: admin.school,
    });

    await this.recruiterRepository.save(recruiter);
    const loginUrl = `${process.env.FRONTEND_URL}/auth/login}`;
    const first_name = createUserDto.first_name;

    await this.mailService.sendTemplateMail(
      {
        to: createUserDto.email,
        subject: 'Welcome to Audease',
      },
      'welcome-users',
      {
        first_name,
        generated_username,
        generated_password,
        loginUrl,
      },
    );
    return {
      message: 'User created successfully',
    };
  }
}
