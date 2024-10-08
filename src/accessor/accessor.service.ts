import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProspectiveStudent } from '../recruiter/entities/prospective-student.entity';
import { BksdRepository } from '../bksd/bksd.repository';
import { MailService } from '../shared/services/mail.service';
import { FilterDto } from '../bksd/dto/bksd-filter.dto';
import { Student } from '../students/entities/student.entity';

@Injectable()
export class AccessorService {
  private readonly logger = new Logger(AccessorService.name);
  constructor(
    @InjectRepository(ProspectiveStudent)
    private readonly learnerRepository: Repository<ProspectiveStudent>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    private readonly bksdRepository: BksdRepository,
    private readonly mailService: MailService
  ) {}

  async getAllStudents(userId: string, filters: FilterDto) {
    const { funding, chosen_course, application_status, page, limit, search } =
      filters;
    const loggedInUser = await this.bksdRepository.findUser(userId);
    if (!loggedInUser) {
      this.logger.error('User not found');
      throw new NotFoundException('User not found');
    }

    const accessor = await this.bksdRepository.findUser(userId);

    const queryBuilder = this.learnerRepository
      .createQueryBuilder('student')
      .where('student.school = :schoolId', {
        schoolId: accessor.school.id,
      })
      .andWhere('student.application_mail = :application_mail', {
        application_mail: 'Sent',
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

  async approveApplication(userId: string, studentId: string) {
    const accessor = await this.bksdRepository.findUser(userId);

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

    await this.learnerRepository.update(learner.id, {
      application_status: 'Approved',
    });

    await this.studentRepository.update(student.id, {
      application_status: 'Approved',
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

  async rejectApplication(userId: string, studentId: string) {
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

    await this.learnerRepository.update(learner.id, {
      application_status: 'Rejected',
    });

    await this.studentRepository.update(student.id, {
      application_status: 'Rejected',
    });

    const updatedStudent = await this.learnerRepository.findOne({
      where: { id: learner.id },
      relations: ['school'],
    });

    const loginUrl = `${process.env.FRONTEND_URL}`;
    const first_name = updatedStudent.name.split(' ')[0];

    await this.mailService.sendTemplateMail(
      {
        to: updatedStudent.email,
        subject: 'Action Required: Verify Your Profile Details on Audease',
      },
      'rejection-mail',
      {
        first_name,
        loginUrl,
      }
    );

    return {
      message: "Learner's application has been rejected",
      student: updatedStudent,
    };
  }
}
