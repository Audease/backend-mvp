import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProspectiveStudent } from '../recruiter/entities/prospective-student.entity';
import { BksdRepository } from '../bksd/bksd.repository';
import { MailService } from '../shared/services/mail.service';
import { FilterDto } from './dto/accessor-filter.dto';
import { Student } from '../students/entities/student.entity';
import { FormSubmission } from '../form/entity/form-submission.entity';
import { SubmissionStatus } from '../utils/enum/submission-status';
import { DataSource } from 'typeorm';

@Injectable()
export class AccessorService {
  private readonly logger = new Logger(AccessorService.name);
  constructor(
    @InjectRepository(ProspectiveStudent)
    private readonly learnerRepository: Repository<ProspectiveStudent>,
    @InjectRepository(FormSubmission)
    private readonly formSubmissionRepository: Repository<FormSubmission>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    private readonly bksdRepository: BksdRepository,
    private readonly mailService: MailService,
    private readonly dataSource: DataSource
  ) {}

  async getAllStudents(userId: string, filters: FilterDto) {
    const {
      funding,
      chosen_course,
      application_status,
      page = 1,
      limit = 10,
      search,
    } = filters;

    const loggedInUser = await this.bksdRepository.findUser(userId);
    if (!loggedInUser) {
      this.logger.error('User not found');
      throw new NotFoundException('User not found');
    }

    const queryBuilder = this.learnerRepository
      .createQueryBuilder('prospective_student')
      .where('prospective_student.school = :schoolId', {
        schoolId: loggedInUser.school.id,
      })
      .andWhere('prospective_student.is_archived = :isArchived', {
        isArchived: false,
      })
      .andWhere('prospective_student.application_mail = :application_mail', {
        application_mail: 'Sent',
      });

    if (search) {
      queryBuilder.andWhere(
        'prospective_student.name LIKE :search OR prospective_student.email LIKE :search',
        { search: `%${search}%` }
      );
    }

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

    if (application_status) {
      queryBuilder.andWhere(
        'prospective_student.application_status LIKE :application_status',
        {
          application_status: `%${application_status}%`,
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
    const accessor = await this.bksdRepository.findUser(userId);

    const student = await this.learnerRepository.findOne({
      where: {
        id: studentId,
        application_mail: 'Sent',
        school: { id: accessor.school.id },
      },
      relations: ['school'],
    });

    if (!student) {
      throw new NotFoundException(`Learner with id: ${studentId} not found`);
    }

    return student;
  }

  // Improved approveApplication method in accessor.service.ts
  async approveApplication(userId: string, studentId: string) {
    const accessor = await this.bksdRepository.findUser(userId);

    if (!accessor) {
      this.logger.error('Accessor not found for the user');
      throw new NotFoundException('Accessor not found for the user');
    }

    const learner = await this.learnerRepository.findOne({
      where: {
        id: studentId,
        application_mail: 'Sent',
        school: { id: accessor.school.id },
      },
      relations: ['school'],
    });

    if (!learner) {
      throw new NotFoundException(`Learner with id: ${studentId} not found`);
    }

    const student = await this.studentRepository.findOne({
      where: { email: learner.email, school: { id: learner.school.id } },
      relations: ['school'],
    });

    if (!student) {
      throw new NotFoundException('Student record not found');
    }

    // Transaction to ensure both updates succeed or fail together
    await this.dataSource.transaction(async manager => {
      await manager.update(ProspectiveStudent, learner.id, {
        application_status: 'Approved',
      });

      await manager.update(Student, student.id, {
        application_status: 'Approved',
      });

      // Find all submitted forms for this student
      const submissions = await manager.find(FormSubmission, {
        where: {
          student: { id: studentId },
          status: SubmissionStatus.SUBMITTED,
        },
      });

      if (submissions.length === 0) {
        this.logger.warn(`No form submissions found for student ${studentId}`);
      } else {
        // Mark all forms as submitted
        await Promise.all(
          submissions.map(submission => {
            submission.is_submitted = true;
            return manager.save(FormSubmission, submission);
          })
        );
      }
    });

    const updatedStudent = await this.learnerRepository.findOne({
      where: { id: learner.id },
      relations: ['school'],
    });

    return {
      message: "Learner's application has been approved",
      student: updatedStudent,
    };
  }

  // Improved rejectApplication method in accessor.service.ts
  async rejectApplication(userId: string, studentId: string, reason: string) {
    if (!reason) {
      throw new BadRequestException('Rejection reason is required');
    }

    const accessor = await this.bksdRepository.findUser(userId);

    if (!accessor) {
      this.logger.error('Accessor not found for the user');
      throw new NotFoundException('Accessor not found for the user');
    }

    const learner = await this.learnerRepository.findOne({
      where: {
        id: studentId,
        application_mail: 'Sent',
        school: { id: accessor.school.id },
      },
      relations: ['school'],
    });

    if (!learner) {
      throw new NotFoundException(`Learner with id: ${studentId} not found`);
    }

    const student = await this.studentRepository.findOne({
      where: { email: learner.email, school: { id: learner.school.id } },
      relations: ['school'],
    });

    if (!student) {
      throw new NotFoundException('Student record not found');
    }

    // Transaction to ensure both updates succeed or fail together
    await this.dataSource.transaction(async manager => {
      await manager.update(ProspectiveStudent, learner.id, {
        application_status: 'Rejected',
      });

      await manager.update(Student, student.id, {
        application_status: 'Rejected',
      });

      // Update form submissions
      const submissions = await manager.find(FormSubmission, {
        where: {
          student: { id: studentId },
          status: SubmissionStatus.SUBMITTED,
        },
      });

      await Promise.all(
        submissions.map(submission => {
          submission.is_submitted = false;
          submission.status = SubmissionStatus.REJECTED;
          submission.reviewComment = reason;
          return manager.save(FormSubmission, submission);
        })
      );
    });

    const updatedStudent = await this.learnerRepository.findOne({
      where: { id: learner.id },
      relations: ['school'],
    });

    // Send rejection email
    const loginUrl = `${process.env.FRONTEND_URL}`;
    const first_name = updatedStudent.name.split(' ')[0];

    try {
      await this.mailService.sendTemplateMail(
        {
          to: updatedStudent.email,
          subject: 'Action Required: Verify Your Profile Details on Audease',
        },
        'rejection-mail',
        {
          first_name,
          loginUrl,
          reason,
        }
      );
    } catch (error) {
      this.logger.error(`Failed to send rejection email: ${error.message}`);
      // Continue with the function even if email fails
    }

    return {
      message: "Learner's application has been rejected",
      student: updatedStudent,
    };
  }
}
