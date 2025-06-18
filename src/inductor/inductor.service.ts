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
    if (!accessor) {
      this.logger.error('User not found');
      throw new NotFoundException('User not found');
    }

    const queryBuilder = this.learnerRepository
      .createQueryBuilder('prospective_student')
      .where('prospective_student.school_id = :schoolId', {
        schoolId: accessor.school.id,
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

    const [results, total] = await queryBuilder
      .skip((page - 1) * limit)
      .orderBy('prospective_student.created_at', 'DESC') // Add this line
      .take(limit)
      .getManyAndCount();

    return {
      data: results || [],
      total,
      page,
      limit,
      lastPage: Math.ceil(total / limit),
      totalPages: Math.ceil(total / limit), // Including both for compatibility
    };
  }

  async getFilteredStudents(userId: string, filters: FilterDto) {
    const {
      funding,
      chosen_course,
      application_status,
      page = 1,
      limit = 10,
      search,
      inductor_status,
    } = filters;
    const loggedInUser = await this.bksdRepository.findUser(userId);
    if (!loggedInUser) {
      this.logger.error('User not found');
      throw new NotFoundException('User not found');
    }

    // Create the base query builder
    const queryBuilder = this.learnerRepository
      .createQueryBuilder('prospective_student')
      .where('prospective_student.school_id = :schoolId', {
        schoolId: loggedInUser.school.id,
      })
      .andWhere('prospective_student.is_archived = :isArchived', {
        isArchived: false,
      })
      .andWhere(
        'prospective_student.application_status = :application_status_approved',
        {
          application_status_approved: 'Approved',
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

    // Apply application_status filter if provided (in addition to the base 'Approved' filter)
    if (application_status && application_status !== 'Approved') {
      // We need a specific filter here to handle the case where we want to further filter
      // the already filtered "Approved" students
      queryBuilder.andWhere(
        'prospective_student.inductor_status = :inductor_status',
        {
          inductor_status: application_status,
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

    // Execute the query with pagination
    const [results, total] = await queryBuilder
      .skip((page - 1) * limit)
      .orderBy('prospective_student.created_at', 'DESC') // Add this line
      .take(limit)
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
    // Get student information
    const student = await this.getStudent(userId, studentId);
    if (!student) {
      throw new NotFoundException(`Learner with id: ${studentId} not found`);
    }

    // Determine which template to use based on input data
    const isOneClickPaste = !!dto.meetingInfo && !dto.meetingUrl;
    const templateName = isOneClickPaste
      ? 'meeting-link-pasted'
      : 'meeting-link';

    let emailData;

    if (isOneClickPaste) {
      // For one-click paste, we just send the raw meeting info
      emailData = {
        firstName: student.name,
        meetingInfo: dto.meetingInfo,
      };
    } else {
      // For individual fields, we use the structured data
      emailData = {
        firstName: student.name,
        meetingId: dto.meetingId || 'Not provided',
        meetingUrl: dto.meetingUrl || 'Not provided',
        password: dto.password || 'Not provided',
        startTime: dto.startTime
          ? this.formatDateForDisplay(dto.startTime)
          : 'Not specified',
        endTime: dto.endTime
          ? this.formatDateForDisplay(dto.endTime)
          : 'Not specified',
      };
    }

    // Send email
    await this.mailService.sendTemplateMail(
      {
        to: student.email,
        subject: 'Scheduled Meeting with Inductor',
      },
      templateName,
      emailData
    );

    // Update student status
    student.inductor_status = 'Sent';
    await this.learnerRepository.save(student);

    return {
      message: 'Meeting link sent successfully',
      studentId,
      templateUsed: isOneClickPaste ? 'one-click-paste' : 'structured-fields',
    };
  }

  // Keep this helper method for date formatting
  private formatDateForDisplay(dateString: string): string {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString; // Return as is if not a valid date
      }

      return date.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch (error) {
      return dateString; // Return original string if parsing fails
    }
  }

  async updateAttendanceStatus(
    userId: string,
    studentId: string,
    status: 'present' | 'absent'
  ) {
    const student = await this.getStudent(userId, studentId);

    if (!student) {
      throw new NotFoundException(`Learner with id: ${studentId} not found`);
    }

    student.attendance_status = status;
    await this.learnerRepository.save(student);

    return {
      message: `Attendance status updated to ${status}`,
      studentId,
      status,
    };
  }
}
