import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ProspectiveStudent } from '../recruiter/entities/prospective-student.entity';
import { BksdRepository } from '../bksd/bksd.repository';
import { FilterDto } from '../bksd/dto/bksd-filter.dto';

@Injectable()
export class CertificateService {
  private readonly logger = new Logger(CertificateService.name);
  constructor(
    @InjectRepository(ProspectiveStudent)
    private readonly learnerRepository: Repository<ProspectiveStudent>,
    private readonly bksdRepository: BksdRepository
  ) {}

  async getAllStudents(userId: string, page: number, limit: number) {
    const accessor = await this.bksdRepository.findUser(userId);
    const queryBuilder = this.learnerRepository
      .createQueryBuilder('student')
      .where('student.school = :schoolId', {
        schoolId: accessor.school.id,
      })
      .andWhere('student.lazer_status = :lazer_status', {
        lazer_status: 'Approved',
      });

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

  async getFilteredStudents(userId: string, filters: FilterDto) {
    const { funding, chosen_course, search } = filters;
    const accessor = await this.bksdRepository.findUser(userId);
    const queryBuilder = this.learnerRepository
      .createQueryBuilder('student')
      .where('student.school = :schoolId', {
        schoolId: accessor.school.id,
      })
      .andWhere('student.lazer_status = :lazer_status', {
        lazer_status: 'Approved',
      });

    if (search) {
      queryBuilder.andWhere(
        'student.first_name LIKE :search OR student.last_name LIKE :search OR student.middle_name LIKE :search OR student.email LIKE :search',
        { search: `%${search}%` }
      );
    }

    if (funding) {
      queryBuilder.andWhere('student.funding = :funding', { funding });
    }

    if (chosen_course) {
      queryBuilder.andWhere('student.chosen_course = :chosen_course', {
        chosen_course,
      });
    }

    const [results, total] = await queryBuilder.getManyAndCount();

    return {
      data: results || [],
      total,
    };
  }

  //   Approve a student on the Certificate dashboard
  async approveStudent(userId: string, studentId: string) {
    const accessor = await this.bksdRepository.findUser(userId);

    const student = await this.bksdRepository.findLearner(studentId, accessor);

    if (!student) {
      throw new NotFoundException(`Learner with id: ${studentId} not found`);
    }

    student.lazer_status = 'Approved';

    await this.learnerRepository.save(student);

    return student;
  }
}
