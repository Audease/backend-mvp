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
    if (!file) {
      this.logger.error('No file uploaded');
      throw new BadRequestException('No file uploaded');
    }

    const loggedInUser = await this.recruiterRepository.findUser(userId);
    if (!loggedInUser) {
      this.logger.error('User not found');
      throw new NotFoundException('User not found');
    }

    const records = [];
    // Parse the CSV file
    try {
      const parser = parse(file.buffer.toString(), {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });

      for await (const record of parser) {
        records.push(record);
      }
    } catch (error) {
      this.logger.error(`Error parsing CSV: ${error.message}`);
      throw new BadRequestException(`Error parsing CSV: ${error.message}`);
    }

    if (records.length === 0) {
      this.logger.warn('CSV file contains no valid records');
      throw new BadRequestException('CSV file contains no valid records');
    }

    // Process and validate records
    const learners = [];
    const errors = [];

    for (const record of records) {
      try {
        // Check required fields
        if (!record.name || !record.email || !record.date_of_birth) {
          errors.push(
            `Record missing required fields: ${JSON.stringify(record)}`
          );
          continue;
        }

        // Check if learner already exists
        const learnerExist = await this.recruiterRepository.findLearner({
          email: record.email,
          mobile_number: record.mobile_number,
        });

        if (learnerExist) {
          errors.push(
            `Duplicate learner found: ${record.email}, ${record.mobile_number}`
          );
          continue;
        }

        // Format date
        let formattedDate;
        try {
          const date = new Date(record.date_of_birth);
          if (isNaN(date.getTime())) {
            errors.push(
              `Invalid date format: ${record.date_of_birth} for record: ${record.email}`
            );
            continue;
          }
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          formattedDate = `${year}-${month}-${day}`;
        } catch (error) {
          errors.push(
            `Error formatting date for record: ${record.email} - ${error.message}`
          );
          continue;
        }

        // Create learner object
        const learner = this.learnerRepository.create({
          name: record.name,
          date_of_birth: formattedDate,
          mobile_number: record.mobile_number || null,
          email: record.email,
          NI_number: record.NI_number || null,
          passport_number: record.passport_number || null,
          home_address: record.home_address || null,
          funding: record.funding || null,
          level: record.level ? parseInt(record.level, 10) : null,
          awarding: record.awarding || null,
          chosen_course: record.chosen_course || null,
          user: loggedInUser,
          school: loggedInUser.school,
          onboarding_status: 'completed', // Set default status
        });

        learners.push(learner);
      } catch (error) {
        errors.push(
          `Error processing record: ${JSON.stringify(record)} - ${error.message}`
        );
      }
    }

    if (learners.length === 0) {
      this.logger.error('No valid learners found in CSV');
      throw new BadRequestException(
        `No valid learners found in CSV. Errors: ${errors.join('; ')}`
      );
    }

    // Save learners to database
    try {
      const savedLearners = await this.learnerRepository.save(learners);
      this.logger.log(`Successfully imported ${savedLearners.length} learners`);

      return {
        message: `Successfully imported ${savedLearners.length} learners`,
        imported: savedLearners.length,
        errors: errors.length > 0 ? errors : undefined,
        total: records.length,
      };
    } catch (error) {
      this.logger.error(`Error saving learners: ${error.message}`);
      throw new BadRequestException(`Error saving learners: ${error.message}`);
    }
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
      .andWhere('prospective_student.is_archived = :isArchived', {
        isArchived: false,
      })
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

    const student = await this.recruiterRepository.findStudent(studentId);
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

    const student = await this.recruiterRepository.findStudent(studentId);

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
    const {
      funding,
      chosen_course,
      page = 1,
      limit = 10,
      search,
      sort = 'asc',
    } = filterDto;

    // Ensure page and limit are numbers
    const pageNum = Number(page);
    const limitNum = Number(limit);

    const loggedInUser = await this.recruiterRepository.findUser(userId);
    if (!loggedInUser) {
      this.logger.error('User not found');
      throw new NotFoundException('User not found');
    }

    // Create query builder for the main data
    const queryBuilder = this.learnerRepository
      .createQueryBuilder('prospective_student')
      .leftJoinAndSelect('prospective_student.user', 'creator_user')
      .leftJoin(
        'users',
        'student_user',
        'student_user.email = prospective_student.email AND student_user.role_id != creator_user.role_id'
      )
      .where('prospective_student.school_id = :schoolId', {
        schoolId: loggedInUser.school.id,
      })
      .andWhere('prospective_student.is_archived = :isArchived', {
        isArchived: false,
      });

    // Apply filters
    if (funding) {
      queryBuilder.andWhere('prospective_student.funding ILIKE :funding', {
        funding: `%${funding}%`,
      });
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
          'CAST(prospective_student.level AS TEXT) ILIKE :search OR ' +
          'prospective_student.awarding ILIKE :search OR ' +
          'prospective_student.chosen_course ILIKE :search OR ' +
          'student_user.username ILIKE :search)',
        {
          search: `%${search}%`,
        }
      );
    }

    if (chosen_course) {
      queryBuilder.andWhere(
        'prospective_student.chosen_course ILIKE :chosen_course',
        {
          chosen_course: `%${chosen_course}%`,
        }
      );
    }

    // Apply sorting
    const sortDirection = sort.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    queryBuilder.orderBy('prospective_student.created_at', sortDirection);

    // Create count query builder
    const countQueryBuilder = this.learnerRepository
      .createQueryBuilder('prospective_student')
      .where('prospective_student.school_id = :schoolId', {
        schoolId: loggedInUser.school.id,
      })
      .andWhere('prospective_student.is_archived = :isArchived', {
        isArchived: false,
      });

    // Apply the same filters to count query
    if (funding) {
      countQueryBuilder.andWhere('prospective_student.funding ILIKE :funding', {
        funding: `%${funding}%`,
      });
    }

    if (search) {
      countQueryBuilder.andWhere(
        '(prospective_student.name ILIKE :search OR ' +
          'prospective_student.email ILIKE :search OR ' +
          'prospective_student.mobile_number ILIKE :search OR ' +
          'prospective_student.NI_number ILIKE :search OR ' +
          'prospective_student.passport_number ILIKE :search OR ' +
          'prospective_student.home_address ILIKE :search OR ' +
          'prospective_student.funding ILIKE :search OR ' +
          'CAST(prospective_student.level AS TEXT) ILIKE :search OR ' +
          'prospective_student.awarding ILIKE :search OR ' +
          'prospective_student.chosen_course ILIKE :search)',
        {
          search: `%${search}%`,
        }
      );
    }

    if (chosen_course) {
      countQueryBuilder.andWhere(
        'prospective_student.chosen_course ILIKE :chosen_course',
        {
          chosen_course: `%${chosen_course}%`,
        }
      );
    }

    // Get total count and paginated data separately
    const total = await countQueryBuilder.getCount();

    // Add specific fields, pagination and execute
    const results = await queryBuilder
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
      .offset((pageNum - 1) * limitNum)
      .limit(limitNum)
      .getRawMany();

    // Transform data
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

    // Return with consistent pagination structure
    return {
      data: transformedData,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      lastPage: Math.ceil(total / limitNum), // for consistency
    };
  }
}
