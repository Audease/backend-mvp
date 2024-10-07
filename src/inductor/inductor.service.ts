import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ProspectiveStudent } from '../recruiter/entities/prospective-student.entity';
import { BksdRepository } from '../bksd/bksd.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { FilterDto } from '../bksd/dto/bksd-filter.dto';

@Injectable()
export class InductorService {
  private readonly logger = new Logger(InductorService.name);
  constructor(
    @InjectRepository(ProspectiveStudent)
    private readonly learnerRepository: Repository<ProspectiveStudent>,
    private readonly bksdRepository: BksdRepository
  ) {}
  async getAllStudents(userId: string, filters: FilterDto) {
    const { funding, chosen_course, application_status, page, limit, search } =
      filters;

    const accessor = await this.bksdRepository.findUser(userId);

    const queryBuilder = this.learnerRepository
      .createQueryBuilder('student')
      .where('student.school = :schoolId', {
        schoolId: accessor.school.id,
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

    if (application_status) {
      queryBuilder.andWhere(
        'student.application_status LIKE :application_status',
        {
          application_mail: `%${application_status}%`,
        }
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
    const loggedInUser = await this.bksdRepository.findUser(userId);
    if (!loggedInUser) {
      this.logger.error('User not found');
      throw new NotFoundException('User not found');
    }

    const accessor = await this.bksdRepository.findUser(userId);

    const student = await this.learnerRepository.findOne({
      where: {
        id: studentId,
        application_status: 'Approved',
        school: { id: accessor.school.id },
      },
      relations: ['school'],
    });

    if (!student) {
      throw new NotFoundException(`Learner with id: ${studentId} not found`);
    }

    return student;
  }
}
