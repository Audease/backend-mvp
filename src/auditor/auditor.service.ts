import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AuditorRepository } from './auditor.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Student } from '../students/entities/student.entity';
import { Repository } from 'typeorm';
import { FilterParam } from './dto/auditor-filter.dto';

@Injectable()
export class AuditorService {
  private readonly logger = new Logger(AuditorService.name);
  constructor(
    private readonly auditorRepository: AuditorRepository,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>
  ) {}

  async getAllStudents(userId: string, filters: FilterParam) {
    const { funding, chosen_course, course_status, page, limit, search } =
      filters;

    const loggedInUser = await this.auditorRepository.findUser(userId);
    if (!loggedInUser) {
      this.logger.error('User not found');
      throw new NotFoundException('User not found');
    }

    const queryBuilder = this.studentRepository
      .createQueryBuilder('student')
      .where('student.school = :schoolId', {
        schoolId: loggedInUser.school.id,
      })
      .andWhere('student.application_status = :application_status', {
        application_status: 'Approved',
      });

    if (search) {
      queryBuilder.andWhere(
        'student.first_name LIKE :search OR student.last_name LIKE :search OR student.middle_name LIKE :search OR student.email LIKE :search',
        { search: `%${search}%` }
      );
    }

    if (funding) {
      queryBuilder.andWhere('student.funding LIKE :funding', {
        funding: `%${funding}%`,
      });
    }

    if (chosen_course) {
      queryBuilder.andWhere('student.chosen_course LIKE :chosen_course', {
        chosen_course: `%${chosen_course}%`,
      });
    }

    if (course_status) {
      queryBuilder.andWhere('student.course_status LIKE :course_status', {
        course_status: `%${course_status}%`,
      });
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
}
