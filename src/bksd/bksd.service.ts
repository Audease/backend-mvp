import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProspectiveStudent } from '../recruiter/entities/prospective-student.entity';
import { UserService } from '../users/users.service';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { Role } from '../utils/enum/role';
import { Student } from '../students/entities/student.entity';
import { MailService } from '../shared/services/mail.service';
import { BksdRepository } from './bksd.repository';
import { PaginationParamsDto } from '../recruiter/dto/pagination-params.dto';
import { StudentFilterDto } from '../shared/dto/student-filter.dto';
import { UsernameGeneratorService } from '../shared/services/username-generator.service';

@Injectable()
export class BksdService {
  private readonly logger = new Logger(BksdService.name);
  constructor(
    @InjectRepository(ProspectiveStudent)
    private readonly learnerRepository: Repository<ProspectiveStudent>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    private readonly userService: UserService,

    private readonly mailService: MailService,
    private readonly bksdRepository: BksdRepository,
    private readonly usernameGeneratorService: UsernameGeneratorService
  ) {}

  async sendLearnerMail(userId: string, applicantId: string) {
    // check if the logged in user is an accessor
    const loggedInUser = await this.bksdRepository.findUser(userId);
    if (!loggedInUser) {
      this.logger.error('User not found');
      throw new NotFoundException('User not found');
    }

    const learner = await this.bksdRepository.findLearner(
      applicantId,
      loggedInUser
    );
    if (learner) {
      const accessorUsername = loggedInUser.username;
      const collegeName =
        this.usernameGeneratorService.extractCollegeNameFromUsername(
          accessorUsername
        ) || loggedInUser.school.college_name;
      // const sanitizedCollegeName = accessorUsername.split('.')[1];
      // const sanitizedLearnerName = learner.name.replace(/\s+/g, '_');
      const college_id = loggedInUser.school.id;
      let generated_username = this.usernameGeneratorService.generateUsername(
        learner.name,
        collegeName,
        'learner'
      );

      const role = await this.userService.getRoleByName(Role.STUDENT);

      const userExists =
        await this.userService.getUserByUsername(generated_username);
      if (userExists) {
        const randomSuffix =
          this.usernameGeneratorService.generateRandomSuffix();
        generated_username = this.usernameGeneratorService.generateUsername(
          learner.name,
          collegeName,
          'learner',
          randomSuffix
        );
      }

      const generated_password = crypto.randomBytes(8).toString('hex');

      const emailExists = await this.userService.getUserByEmail(learner.email);
      if (emailExists) {
        this.logger.error('Email already exists');
        throw new ConflictException('Email already exists');
      }
      const user = await this.userService.createUserWithCollegeId(
        {
          username: generated_username,
          password: await bcrypt.hashSync(generated_password, 10),
          email: learner.email,
          phone: learner.mobile_number,
          first_name: learner.name.split(' ')[0],
          last_name: learner.name.split(' ')[1],
          role,
        },
        college_id
      );

      const student = this.studentRepository.create({
        user,
        ...learner,
        school: loggedInUser.school,
      });

      console.log('student', student);

      await this.studentRepository.save(student);

      const loginUrl = `${process.env.FRONTEND_URL}`;
      const first_name = learner.name.split(' ')[0];

      await this.mailService.sendTemplateMail(
        {
          to: learner.email,
          subject: 'Your Audease Account Has Been Created!',
        },
        'welcome-users',
        {
          first_name,
          generated_username,
          generated_password,
          loginUrl,
        }
      );

      this.logger.log('Student account created');

      await this.learnerRepository.update(learner.id, {
        application_mail: 'Sent',
      });

      this.logger.log('Mail has been sent to student');
      return { message: 'Mail sent successfully' };
    } else {
      this.logger.error('Learner not found');
      throw new NotFoundException('Learner not found');
    }
  }

  async getAllStudents(userId: string, paginationParams: PaginationParamsDto) {
    const { page, limit, search } = paginationParams;

    const accessor = await this.bksdRepository.findUser(userId);

    if (!accessor) {
      this.logger.error('Accessor not found for the user');
      throw new NotFoundException('Accessor not found for the user');
    }

    const queryBuilder = this.learnerRepository
      .createQueryBuilder('prospective_student')
      .leftJoinAndSelect('prospective_student.user', 'creator_user')
      .leftJoin(
        'users',
        'student_user',
        'student_user.email = prospective_student.email AND student_user.role_id != creator_user.role_id'
      )
      .andWhere('prospective_student.is_archived = :isArchived', {
        isArchived: false,
      })
      .where('prospective_student.school_id = :schoolId', {
        schoolId: accessor.school.id,
      });

    if (search) {
      queryBuilder.andWhere(
        '(prospective_student.name ILIKE :search OR ' +
          'prospective_student.email ILIKE :search OR ' +
          'prospective_student.mobile_number ILIKE :search OR ' +
          'prospective_student.NI_number ILIKE :search OR ' +
          'prospective_student.passport_number ILIKE :search OR ' +
          'prospective_student.home_address ILIKE :search OR ' +
          'prospective_student.funding ILIKE :search OR ' +
          'prospective_student.awarding ILIKE :search OR ' +
          'prospective_student.chosen_course ILIKE :search)',
        {
          search: `%${search}%`,
        }
      );
    }

    const total = await queryBuilder.getCount();

    const results = await queryBuilder
      .skip((page - 1) * limit)
      .select([
        'prospective_student.id',
        'prospective_student.name',
        'prospective_student.email',
        'prospective_student.date_of_birth',
        'prospective_student.mobile_number',
        'prospective_student.NI_number',
        'prospective_student.passport_number',
        'prospective_student.home_address',
        'prospective_student.funding',
        'prospective_student.level',
        'prospective_student.awarding',
        'prospective_student.chosen_course',
        'prospective_student.created_at',
        'prospective_student.application_mail',
        'creator_user.id',
        'creator_user.first_name',
        'creator_user.last_name',
        'student_user.username',
        'student_user.last_login_at',
        'student_user.id',
      ])
      .orderBy('prospective_student.created_at', 'DESC') // Add this line
      .offset((page - 1) * limit)
      .limit(limit)
      .getRawMany();

    const transformedData = results.map(row => ({
      id: row.prospective_student_id,
      name: row.prospective_student_name,
      email: row.prospective_student_email,
      date_of_birth: row.prospective_student_date_of_birth,
      mobile_number: row.prospective_student_mobile_number,
      NI_number: row.prospective_student_NI_number,
      passport_number: row.prospective_student_passport_number,
      home_address: row.prospective_student_home_address,
      funding: row.prospective_student_funding,
      level: row.prospective_student_level,
      awarding: row.prospective_student_awarding,
      chosen_course: row.prospective_student_chosen_course,
      created_at: row.prospective_student_created_at,
      application_mail: row.prospective_student_application_mail,
      created_by: {
        id: row.creator_user_id,
        name: `${row.creator_user_first_name || ''} ${row.creator_user_last_name || ''}`.trim(),
      },
      has_account: !!row.student_user_id,
      user: row.student_user_id
        ? {
            username: row.student_user_username,
            last_login_at: row.student_user_last_login_at,
          }
        : null,
    }));

    return {
      data: transformedData || [],
      page: page,
      limit: limit,
      totalPages: Math.ceil(total / limit),
      lastPage: Math.ceil(total / limit), // for consistency
    };
  }

  async getStudent(userId: string, studentId: string) {
    const accessor = await this.bksdRepository.findUser(userId);

    const student = await this.bksdRepository.findLearner(studentId, accessor);

    if (!student) {
      throw new NotFoundException(`Learner with id: ${studentId} not found`);
    }

    return student;
  }

  async resendLearnerCredentials(userId: string, learnerId: string) {
    const loggedInUser = await this.bksdRepository.findUser(userId);
    if (!loggedInUser) {
      throw new NotFoundException('User not found');
    }

    // Find the prospective student
    const learner = await this.learnerRepository.findOne({
      where: {
        id: learnerId,
        school: { id: loggedInUser.school.id },
      },
      relations: ['school'],
    });

    if (!learner) {
      throw new NotFoundException('Learner not found');
    }

    // Find the existing user account by email
    const existingUser = await this.userService.getUserByEmail(learner.email);
    if (!existingUser) {
      throw new NotFoundException(
        'User account not found. Please create account first.'
      );
    }

    // Since passwords are hashed, we need to generate a new temporary password
    // and update the existing account
    const newPassword = crypto.randomBytes(8).toString('hex');
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.userService.update(existingUser.id, {
      password: hashedPassword,
      is_password_changed: false, // Force password change on next login
    });

    // Send email with new credentials
    const loginUrl = `${process.env.FRONTEND_URL}`;
    const firstName = learner.name.split(' ')[0];

    await this.mailService.sendTemplateMail(
      {
        to: learner.email,
        subject: 'Your Updated Audease Login Details',
      },
      'resend-credentials', // Create new email template
      {
        firstName,
        username: existingUser.username,
        newPassword,
        loginUrl,
      }
    );

    return {
      message: 'Login details resent successfully',
      learnerId,
    };
  }

  // Improved filter method in bksd.service.ts
  async getFilteredStudents(userId: string, filterDto: StudentFilterDto) {
    const {
      funding,
      chosen_course,
      application_mail,
      page = 1,
      limit = 10,
      search,
    } = filterDto;

    const accessor = await this.userService.findOne(userId);
    if (!accessor || !accessor.school) {
      throw new NotFoundException('User or school not found');
    }

    const queryBuilder = this.learnerRepository
      .createQueryBuilder('prospective_student')
      .where('prospective_student.school_id = :schoolId', {
        schoolId: accessor.school.id,
      })
      .andWhere('prospective_student.is_archived = :isArchived', {
        isArchived: false,
      })
      .leftJoinAndSelect('prospective_student.school', 'school');

    if (funding) {
      queryBuilder.andWhere('prospective_student.funding = :funding', {
        funding,
      });
    }

    if (chosen_course) {
      queryBuilder.andWhere(
        'prospective_student.chosen_course = :chosen_course',
        {
          chosen_course,
        }
      );
    }

    if (search) {
      queryBuilder.andWhere(
        '(prospective_student.name ILIKE :search OR ' +
          'prospective_student.email ILIKE :search OR ' +
          'prospective_student.mobile_number ILIKE :search OR ' +
          'prospective_student.NI_number ILIKE :search OR ' +
          'prospective_student.passport_number ILIKE :search OR ' +
          'prospective_student.home_address ILIKE :search OR ' +
          'prospective_student.funding ILIKE :search OR ' +
          'prospective_student.awarding ILIKE :search OR ' +
          'prospective_student.chosen_course ILIKE :search)',
        {
          search: `%${search}%`,
        }
      );
    }

    if (application_mail) {
      queryBuilder.andWhere(
        'prospective_student.application_mail = :application_mail',
        {
          application_mail,
        }
      );
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .orderBy('prospective_student.created_at', 'DESC') // Add this line
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
