import {
  BadRequestException,
  //   BadRequestException,
  ConflictException,
  //   ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProspectiveStudent } from './entities/prospective-student.entity';
import { Repository } from 'typeorm';
import { CreateLearnerDto } from './dto/create-learner.dto';
import { Users } from '../users/entities/user.entity';
import { parse } from 'csv-parse';
import { PaginationParamsDto } from './dto/pagination-params.dto';
import { UpdateLearnerDto } from './dto/update-learner.dto';
import { FilterStudentsDto } from './dto/filter-params.dto';
import { RecruiterRepository } from './recruiter.repository';

@Injectable()
export class RecruiterService {
  private readonly logger = new Logger(RecruiterService.name);

  constructor(
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    @InjectRepository(ProspectiveStudent)
    private readonly learnerRepository: Repository<ProspectiveStudent>,
    private readonly recruiterRepository: RecruiterRepository
  ) {}

  async createLearner(userId: string, createLearnerDto: CreateLearnerDto) {
    const loggedInUser = await this.recruiterRepository.findUser(userId);
    if (!loggedInUser) {
      this.logger.error('User not found');
      throw new NotFoundException('User not found');
    }

    const learnerExist =
      await this.recruiterRepository.findLearner(createLearnerDto);

    if (learnerExist) {
      if (
        learnerExist.email === createLearnerDto.email ||
        learnerExist.mobile_number === createLearnerDto.mobile_number
      ) {
        this.logger.error('Email or mobile number already exist');
        throw new ConflictException('Email or mobile number already exist');
      }
    }

    const formatDate = (dateStr: string): string => {
      const date = new Date(dateStr);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const formattedDate = formatDate(createLearnerDto.date_of_birth);

    const learner = this.learnerRepository.create({
      name: createLearnerDto.name,
      date_of_birth: formattedDate,
      mobile_number: createLearnerDto.mobile_number,
      email: createLearnerDto.email,
      NI_number: createLearnerDto.NI_number,
      passport_number: createLearnerDto.passport_number,
      home_address: createLearnerDto.home_address,
      funding: createLearnerDto.funding,
      level: createLearnerDto.level,
      awarding: createLearnerDto.awarding,
      chosen_course: createLearnerDto.chosen_course,
      user: loggedInUser,
      school: loggedInUser.school,
      onboarding_status: 'completed',
    });

    await this.learnerRepository.save(learner);
    this.logger.log('Learner created successfully');
    return { message: 'You just created a learner' };
  }

  async importLearners(userId: string, file: Express.Multer.File) {
    const loggedInUser = await this.recruiterRepository.findUser(userId);
    if (!loggedInUser) {
      this.logger.error('User not found');
      throw new NotFoundException('User not found');
    }

    // const recruiter = await this.recruiterRepository.findRecruiter(userId);
    // if (!recruiter) {
    //   this.logger.error('Recruiter not found for the user');
    //   throw new NotFoundException('Recruiter not found for the user');
    // }

    const learners = [];
    const parser = parse(file.buffer.toString(), {
      columns: true,
      skip_empty_lines: true,
    });

    for await (const record of parser) {
      const learnerExist = await this.recruiterRepository.findLearner(record);

      if (learnerExist) {
        this.logger.warn(
          `Email or mobile number already exist: ${record.email}, ${record.mobile_number}`
        );
        continue;
      }

      const formatDate = (dateStr: string): string => {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
          throw new Error(`Invalid date format: ${dateStr}`);
        }
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      let formattedDate;
      try {
        formattedDate = formatDate(record.date_of_birth);
      } catch (error) {
        this.logger.error(`Error formatting date for record: ${record}`);
        this.logger.error(error.message);
        continue;
      }

      const learner = this.learnerRepository.create({
        name: record.name,
        date_of_birth: formattedDate,
        mobile_number: record.mobile_number,
        email: record.email,
        NI_number: record.NI_number,
        passport_number: record.passport_number,
        home_address: record.home_address,
        funding: record.funding,
        level: record.level,
        awarding: record.awarding,
        chosen_course: record.chosen_course,
        user: loggedInUser,
        school: loggedInUser.school,
      });

      learners.push(learner);
    }

    const newLearners = await this.learnerRepository.save(learners);
    this.logger.log('Learners created successfully from CSV');
    return { message: 'You just created learners from CSV', newLearners };
  }

  async getAllStudents(userId: string, paginationParams: PaginationParamsDto) {
    const { page = 1, limit = 10 } = paginationParams;

    if (page < 1 || limit < 1) {
      throw new BadRequestException('Page and limit must be positive numbers.');
    }

    const loggedInUser = await this.recruiterRepository.findUser(userId);
    const schoolId = loggedInUser.school.id;
    if (!loggedInUser) {
      this.logger.error('User not found');
      throw new NotFoundException('User not found');
    }

    const queryBuilder = this.learnerRepository
      .createQueryBuilder('prospective_student')
      .select([
        'prospective_student.id',
        'prospective_student.name',
        'prospective_student.mobile_number',
        'prospective_student.email',
        'prospective_student.level',
        'prospective_student.date_of_birth',
        'prospective_student.home_address',
        'prospective_student.funding',
        'prospective_student.chosen_course',
        'prospective_student.passport_number',
        'prospective_student.NI_number',
        'prospective_student.awarding',
        'prospective_student.created_at',
      ])
      .where('prospective_student.school_id = :schoolId', { schoolId });

    const [result, total] = await Promise.all([
      queryBuilder
        .skip((page - 1) * limit)
        .take(limit)
        .getMany(),
      queryBuilder.getCount(),
    ]);

    return {
      result,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getStudent(userId: string, studentId: string) {
    const loggedInUser = await this.recruiterRepository.findUser(userId);
    if (!loggedInUser) {
      this.logger.error('User not found');
      throw new NotFoundException('User not found');
    }

    const student = await this.recruiterRepository.findStudent(
      studentId,
      loggedInUser.id
    );
    if (!student) {
      throw new NotFoundException(`Learner with id: ${studentId} not found`);
    }

    return student;
  }

  async editInformation(
    userId: string,
    studentId: string,
    updateLearnerDto: UpdateLearnerDto
  ) {
    const loggedInUser = await this.recruiterRepository.findUser(userId);
    if (!loggedInUser) {
      this.logger.error('User not found');
      throw new NotFoundException('User not found');
    }

    const student = await this.recruiterRepository.findStudent(
      studentId,
      loggedInUser.id
    );

    if (!student) {
      throw new NotFoundException(`Learner with id: ${studentId} not found`);
    }

    const updatedInfo = await this.learnerRepository.preload({
      id: studentId,
      ...updateLearnerDto,
    });

    if (!updatedInfo) {
      throw new NotFoundException(`Learner with id: ${studentId} not found`);
    }

    return await this.learnerRepository.save(updatedInfo);
  }

  async deleteStudent(userId: string, studentId: string) {
    const loggedInUser = await this.recruiterRepository.findUser(userId);
    if (!loggedInUser) {
      this.logger.error('User not found');
      throw new NotFoundException('User not found');
    }

    const student = await this.learnerRepository.findOneBy({
      id: studentId,
      user: { id: loggedInUser.id },
    });

    if (!student) {
      this.logger.error('Learner not found');
      throw new NotFoundException(`Learner not found`);
    }

    const result = await this.learnerRepository.delete(studentId);

    if (result.affected === 0) {
      this.logger.error('Site could not be deleted');
      throw new NotFoundException('Site could not be deleted');
    }
  }

  async getFilteredStudents(userId: string, filterDto: FilterStudentsDto) {
    const { funding, chosen_course, page, limit } = filterDto;

    const loggedInUser = await this.recruiterRepository.findUser(userId);
    if (!loggedInUser) {
      this.logger.error('User not found');
      throw new NotFoundException('User not found');
    }

    // const recruiter = await this.recruiterRepository.findRecruiter(userId);

    // if (!recruiter) {
    //   this.logger.error('Recruiter not found for the user');
    //   throw new NotFoundException('Recruiter not found for the user');
    // }

    const queryBuilder = this.learnerRepository
      .createQueryBuilder('prospective_student')
      .innerJoin('prospective_student.user', 'user', 'user.id = :userId')
      .where('user.id = :userId', { userId: loggedInUser.id })
      .select([
        'prospective_student.id',
        'prospective_student.first_name',
        'prospective_student.last_name',
        'prospective_student.middle_name',
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
      ]);

    // Apply filters
    if (funding) {
      queryBuilder.andWhere('prospective_student.funding LIKE :funding', {
        funding: `%${funding}%`,
      });
    }

    if (chosen_course) {
      queryBuilder.andWhere(
        'prospective_student.chosen_course LIKE :chosen_course',
        {
          chosen_course: `%${chosen_course}%`,
        }
      );
    }

    // Pagination
    const total = await queryBuilder.getCount();
    const data = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, total };
  }
}
