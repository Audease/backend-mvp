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

  async getAllStudents(userId: string, page: number, limit: number) {
    const accessor = await this.bksdRepository.findUser(userId);
    const queryBuilder = this.learnerRepository
      .createQueryBuilder('prospective_student')
      .where('prospective_student.school = :schoolId', {
        schoolId: accessor.school.id,
      })
      .andWhere(
        'prospective_student.application_status = :application_status',
        {
          application_status: 'Approved',
        }
      );

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

  async getFilteredStudents(userId: string, filters: StudentFilterDto) {
    const { funding, chosen_course, search, inductor_status } = filters;
    const accessor = await this.bksdRepository.findUser(userId);
    const queryBuilder = this.learnerRepository
      .createQueryBuilder('prospective_student')
      .where('prospective_student.school = :schoolId', {
        schoolId: accessor.school.id,
      })
      .andWhere(
        'prospective_student.application_status = :application_status',
        {
          application_status: 'Approved',
        }
      );

    if (search) {
      queryBuilder.andWhere(
        'prospective_student.first_name LIKE :search OR prospective_student.email LIKE :search',
        { search: `%${search}%` }
      );
    }

    if (funding) {
      queryBuilder.andWhere('prospective_student.funding LIKE :funding', {
        funding: `%${funding}%`,
      });
    }

    if (search) {
      queryBuilder.andWhere(
        '(prospective_student.name LIKE :search OR ' +
          'prospective_student.email LIKE :search OR ' +
          'prospective_student.mobile_number LIKE :search OR ' +
          'prospective_student.NI_number LIKE :search OR ' +
          'prospective_student.passport_number LIKE :search OR ' +
          'prospective_student.home_address LIKE :search OR ' +
          'prospective_student.funding LIKE :search OR ' +
          'CAST(prospective_student.level AS TEXT) LIKE :search OR ' +
          'prospective_student.awarding LIKE :search OR ' +
          'prospective_student.chosen_course LIKE :search)',
        {
          search: `%${search}%`,
        }
      );
    }

    if (chosen_course) {
      queryBuilder.andWhere(
        'prospective_student.chosen_course LIKE :chosen_course',
        {
          chosen_course: `%${chosen_course}%`,
        }
      );
    }

    if (inductor_status) {
      queryBuilder.andWhere(
        'prospective_student.inductor_status = :inductor_status',
        {
          inductor_status,
        }
      );
    }

    const [results, total] = await queryBuilder.getManyAndCount();

    return {
      data: results || [],
      total,
      page: 1,
      lastPage: 1,
    };
  }

  async approveStudent(userId: string, studentId: string) {
    const student = await this.learnerRepository.findOne({
      where: { id: studentId },
    });

    if (!student) {
      throw new NotFoundException(`Learner with id: ${studentId} not found`);
    }

    student.lazer_status = 'Approved';
    await this.learnerRepository.save(student);

    return student;
  }
}
