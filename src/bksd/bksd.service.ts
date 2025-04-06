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
    private readonly bksdRepository: BksdRepository
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
      const sanitizedCollegeName = accessorUsername.split('.')[1];
      const sanitizedLearnerName = learner.name.replace(/\s+/g, '_');
      const college_id = loggedInUser.school.id;
      let generated_username =
        `${sanitizedLearnerName}.${sanitizedCollegeName}.learner`.toLowerCase();
      const generated_password = crypto
        .randomBytes(12)
        .toString('hex')
        .slice(0, 7);

      const role = await this.userService.getRoleByName(Role.STUDENT);

      const userExists =
        await this.userService.getUserByUsername(generated_username);

      if (userExists) {
        const randomNumber = Math.floor(Math.random() * 1000);
        generated_username =
          `${learner.name}${randomNumber}.${sanitizedCollegeName}.learner`.toLowerCase();
      }

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
      .createQueryBuilder('student')
      .where('prospective_studentschool = :schoolId', {
        schoolId: accessor.school.id,
      });

    if (search) {
      queryBuilder.andWhere(
        'prospective_studentfirst_name LIKE :search OR prospective_studentlast_name LIKE :search OR prospective_studentmiddle_name LIKE :search OR prospective_studentemail LIKE :search',
        { search: `%${search}%` }
      );
    }

    const [results, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: results || [],
      total,
      page,
      lastPage: Math.ceil(total / limit),
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
