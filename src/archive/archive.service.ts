import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProspectiveStudent } from '../recruiter/entities/prospective-student.entity';
import { FilterArchivedDto } from './dto/filtered-archive.dto';
import { UserService } from '../users/users.service';

@Injectable()
export class ArchiveService {
  private readonly logger = new Logger(ArchiveService.name);

  constructor(
    @InjectRepository(ProspectiveStudent)
    private readonly studentRepository: Repository<ProspectiveStudent>,
    private readonly userService: UserService
  ) {}

  async archiveStudent(
    userId: string,
    studentId: string,
    reason?: string
  ): Promise<any> {
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const student = await this.studentRepository.findOne({
      where: {
        id: studentId,
        school: { id: user.school.id },
      },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    student.is_archived = true;
    student.archived_at = new Date();
    student.archived_by = userId;
    student.archive_reason = reason || null;

    await this.studentRepository.save(student);

    return {
      message: 'Student archived successfully',
      studentId: student.id,
      name: student.name,
      archivedAt: student.archived_at,
    };
  }

  async unarchiveStudent(userId: string, studentId: string): Promise<any> {
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const student = await this.studentRepository.findOne({
      where: {
        id: studentId,
        school: { id: user.school.id },
        is_archived: true,
      },
    });

    if (!student) {
      throw new NotFoundException(
        `Archived student with ID ${studentId} not found`
      );
    }

    student.is_archived = false;
    student.archived_at = null;
    student.archived_by = null;
    student.archive_reason = null;

    await this.studentRepository.save(student);

    return {
      message: 'Student successfully restored from archive',
      studentId: student.id,
      name: student.name,
    };
  }

  async getArchivedStudents(
    userId: string,
    filters: FilterArchivedDto
  ): Promise<any> {
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { page = 1, limit = 10, search, from_date, to_date } = filters;

    const queryBuilder = this.studentRepository
      .createQueryBuilder('student')
      .where('student.school_id = :schoolId', { schoolId: user.school.id })
      .andWhere('student.is_archived = :isArchived', { isArchived: true });

    if (search) {
      queryBuilder.andWhere(
        '(student.name ILIKE :search OR ' +
          'student.email ILIKE :search OR ' +
          'student.mobile_number ILIKE :search OR ' +
          'student.NI_number ILIKE :search OR ' +
          'student.passport_number ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (from_date) {
      queryBuilder.andWhere('student.archived_at >= :fromDate', {
        fromDate: from_date,
      });
    }

    if (to_date) {
      queryBuilder.andWhere('student.archived_at <= :toDate', {
        toDate: to_date,
      });
    }

    const [students, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('student.archived_at', 'DESC')
      .getManyAndCount();

    return {
      data: students.map(student => ({
        id: student.id,
        name: student.name,
        email: student.email,
        mobile_number: student.mobile_number,
        archived_at: student.archived_at,
        archive_reason: student.archive_reason,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getArchivedStudentById(
    userId: string,
    studentId: string
  ): Promise<any> {
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const student = await this.studentRepository.findOne({
      where: {
        id: studentId,
        school: { id: user.school.id },
        is_archived: true,
      },
    });

    if (!student) {
      throw new NotFoundException(
        `Archived student with ID ${studentId} not found`
      );
    }

    return student;
  }
}
