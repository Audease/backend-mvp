// src/lazer/lazer.service.ts

import { Repository } from 'typeorm';
import { ProspectiveStudent } from '../recruiter/entities/prospective-student.entity';
import { BksdRepository } from '../bksd/bksd.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { StudentFilterDto } from '../shared/dto/student-filter.dto';

@Injectable()
export class LazerService {
  private readonly logger = new Logger(LazerService.name);
  constructor(
    @InjectRepository(ProspectiveStudent)
    private readonly learnerRepository: Repository<ProspectiveStudent>,
    private readonly bksdRepository: BksdRepository
  ) {}

  async getAllStudents(userId: string, filters: StudentFilterDto) {
    const {
      page = 1,
      limit = 10,
      search,
      funding,
      chosen_course,
      inductor_status,
    } = filters;

    const accessor = await this.bksdRepository.findUser(userId);
    if (!accessor) {
      this.logger.error('User not found');
      throw new NotFoundException('User not found');
    }

    return this.getFilteredStudentsQuery(accessor.school.id, {
      page,
      limit,
      search,
      funding,
      chosen_course,
      inductor_status,
    });
  }

  async getFilteredStudents(userId: string, filters: StudentFilterDto) {
    const accessor = await this.bksdRepository.findUser(userId);
    if (!accessor) {
      this.logger.error('User not found');
      throw new NotFoundException('User not found');
    }

    return this.getFilteredStudentsQuery(accessor.school.id, filters);
  }

  // Helper method to build and execute the filtered query
  private async getFilteredStudentsQuery(
    schoolId: string,
    filters: StudentFilterDto
  ) {
    const {
      funding,
      chosen_course,
      search,
      inductor_status,
      lazer_status,
      page = 1,
      limit = 10,
    } = filters;

    // Create the base query builder
    const queryBuilder = this.learnerRepository
      .createQueryBuilder('prospective_student')
      .where('prospective_student.school_id = :schoolId', {
        schoolId,
      })
      .andWhere('prospective_student.is_archived = :isArchived', {
        isArchived: false,
      })
      .andWhere(
        'prospective_student.application_status = :application_status',
        {
          application_status: 'Approved',
        }
      );

    // Apply search filter if provided
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
          'prospective_student.chosen_course ILIKE :search)',
        {
          search: `%${search}%`,
        }
      );
    }

    // Apply funding filter if provided
    if (funding) {
      queryBuilder.andWhere('prospective_student.funding = :funding', {
        funding,
      });
    }

    // Apply chosen_course filter if provided
    if (chosen_course) {
      queryBuilder.andWhere(
        'prospective_student.chosen_course = :chosen_course',
        {
          chosen_course,
        }
      );
    }

    // Apply inductor_status filter if provided
    if (inductor_status) {
      queryBuilder.andWhere(
        'prospective_student.inductor_status = :inductor_status',
        {
          inductor_status,
        }
      );
    }

    if (lazer_status) {
      queryBuilder.andWhere(
        'prospective_student.lazer_status = :lazer_status',
        {
          lazer_status,
        }
      );
    }

    // Execute the query with pagination
    const [results, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('prospective_student.created_at', 'DESC')
      .getManyAndCount();

    // Return properly structured pagination data
    return {
      data: results || [],
      total,
      page,
      limit,
      lastPage: Math.ceil(total / limit),
      totalPages: Math.ceil(total / limit), // Including both for compatibility
    };
  }

  async approveStudent(userId: string, studentId: string) {
    const accessor = await this.bksdRepository.findUser(userId);
    if (!accessor) {
      this.logger.error('User not found');
      throw new NotFoundException('User not found');
    }

    const student = await this.learnerRepository.findOne({
      where: {
        id: studentId,
        school: { id: accessor.school.id },
      },
    });

    if (!student) {
      throw new NotFoundException(`Learner with id: ${studentId} not found`);
    }

    student.lazer_status = 'Approved';
    await this.learnerRepository.save(student);

    return {
      message: 'Student approved successfully',
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        lazer_status: student.lazer_status,
      },
    };
  }
}
