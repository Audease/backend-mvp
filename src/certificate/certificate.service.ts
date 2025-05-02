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
      .createQueryBuilder('prospective_student')
      .where('prospective_student.school_id = :schoolId', {
        schoolId: accessor.school.id,
      })
      .andWhere('prospective_student.is_archived = :isArchived', {
        isArchived: false,
      })
      .andWhere('prospective_student.lazer_status = :lazer_status', {
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
    const { funding, chosen_course, search, certificate_status } = filters;
    const accessor = await this.bksdRepository.findUser(userId);
    const queryBuilder = this.learnerRepository
      .createQueryBuilder('prospective_student')
      .where('prospective_student.school = :schoolId', {
        schoolId: accessor.school.id,
      })
      .andWhere('prospective_student.is_archived = :isArchived', {
        isArchived: false,
      })
      .andWhere('prospective_student.lazer_status = :lazer_status', {
        lazer_status: 'Approved',
      });

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
          'prospective_student.chosen_course ILIKE :search)',
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

    if (certificate_status) {
      queryBuilder.andWhere(
        'prospective_student.certificate_status ILIKE :certificate_status',
        {
          certificate_status: `%${certificate_status}%`,
        }
      );
    }

    const [results, total] = await queryBuilder.getManyAndCount();

    return {
      data: results || [],
      total,
    };
  }

  //   Approve a student on the Certificate dashboard
  async approveStudent(userId: string, studentId: string) {
    const student = await this.learnerRepository.findOne({
      where: { id: studentId },
    });

    if (!student) {
      throw new NotFoundException(`Learner with id: ${studentId} not found`);
    }

    student.certificate_status = 'Approved';

    await this.learnerRepository.save(student);

    return student;
  }
}
