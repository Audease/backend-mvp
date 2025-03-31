import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ProspectiveStudent } from '../recruiter/entities/prospective-student.entity';
import { BksdRepository } from '../bksd/bksd.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { FilterDto } from './dto/inductor-filter.dto';
import { SendMeetingDto } from './dto/send-meeting.dto';
import { MailService } from '../shared/services/mail.service';
import { UserService } from '../users/users.service';

@Injectable()
export class InductorService {
  private readonly logger = new Logger(InductorService.name);
  constructor(
    @InjectRepository(ProspectiveStudent)
    private readonly learnerRepository: Repository<ProspectiveStudent>,
    private readonly bksdRepository: BksdRepository,
    private readonly mailService: MailService,
    private readonly userService: UserService
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

  async getFilteredStudents(userId: string, filters: FilterDto) {
    const { funding, chosen_course, application_status, search } = filters;
    const accessor = await this.userService.findOne(userId);
    const queryBuilder = this.learnerRepository
      .createQueryBuilder('prospective_student')
      .where('prospective_student.school = :schoolId', {
        schoolId: accessor.school.id,
      })
      .andWhere('student.application_status = :application_status', {
        application_status: 'Approved',
      });

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

    const results = await queryBuilder.getMany();

    return {
      data: results || [],
      total: results.length,
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

  async sendMeetingLink(
    userId: string,
    studentId: string,
    dto: SendMeetingDto
  ) {
    const student = await this.getStudent(userId, studentId);

    this.mailService.sendTemplateMail(
      {
        to: student.email,
        subject: 'Scheduled Meeting with Inductor',
      },
      'meeting-link',
      {
        meetingId: dto.meetingId || null,
        meetingUrl: dto.meetingUrl,
        password: dto.password || null,
        startTime: dto.startTime,
        endTime: dto.endTime,
        firstName: student.name,
      }
    );

    student.inductor_status = 'Sent';
    await this.learnerRepository.save(student);

    return {
      message: 'Meeting link sent successfully',
      studentId,
    };
  }
}
