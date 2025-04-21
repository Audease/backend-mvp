import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
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
    const student = await this.getStudent(userId, studentId);

    // Parse meeting info if provided
    let meetingDetails = {
      meetingId: dto.meetingId || '',
      meetingUrl: dto.meetingUrl || '',
      password: dto.password || '',
      startTime: dto.startTime || '',
      endTime: dto.endTime || '',
    };

    // If meetingInfo is provided, parse it to extract information
    if (dto.meetingInfo) {
      try {
        meetingDetails = this.parseMeetingInfo(dto.meetingInfo, meetingDetails);
        this.logger.log(
          `Successfully parsed meeting info: ${JSON.stringify(meetingDetails)}`
        );
      } catch (error) {
        this.logger.error(`Error parsing meeting info: ${error.message}`);
        // Continue with what we have, the validation below will catch missing required fields
      }
    }

    // Validate that we have at least the required fields
    const missingFields = [];
    if (!meetingDetails.meetingUrl) missingFields.push('Meeting URL');
    if (!meetingDetails.startTime) missingFields.push('Start Time');
    if (!meetingDetails.endTime) missingFields.push('End Time');

    if (missingFields.length > 0) {
      throw new BadRequestException(
        `The following required fields could not be determined: ${missingFields.join(', ')}. Please provide them explicitly.`
      );
    }

    // Format dates for display if they are ISO strings
    const formattedStartTime = this.formatDateForDisplay(
      meetingDetails.startTime
    );
    const formattedEndTime = this.formatDateForDisplay(meetingDetails.endTime);

    // Send email
    await this.mailService.sendTemplateMail(
      {
        to: student.email,
        subject: 'Scheduled Meeting with Inductor',
      },
      'meeting-link',
      {
        meetingId: meetingDetails.meetingId || 'Not provided',
        meetingUrl: meetingDetails.meetingUrl,
        password: meetingDetails.password || 'Not provided',
        startTime: formattedStartTime,
        endTime: formattedEndTime,
        firstName: student.name,
        rawMeetingInfo: dto.meetingInfo
          ? `<p><strong>Original meeting information:</strong><br>${dto.meetingInfo.replace(/\n/g, '<br>')}</p>`
          : '',
      }
    );

    // Update student status
    student.inductor_status = 'Sent';
    await this.learnerRepository.save(student);

    return {
      message: 'Meeting link sent successfully',
      studentId,
      extractedDetails: meetingDetails,
      originalInfo: dto.meetingInfo ? true : false,
      parsingConfidence: this.calculateParsingConfidence(dto, meetingDetails),
      warnings: this.generateParsingWarnings(dto, meetingDetails),
    };
  }

  private parseMeetingInfo(meetingInfo: string, defaultValues: any): any {
    const result = { ...defaultValues };

    // Extract URL - look for any URL format
    const urlRegex = /(https?:\/\/[^\s<>()]+)/gi;
    const urls = meetingInfo.match(urlRegex);
    if (urls && urls.length > 0) {
      // Take the first URL found
      result.meetingUrl = urls[0];
    }

    // Extract Meeting ID - flexible patterns
    const meetingIdPatterns = [
      /meeting id:?\s*([0-9\s-]+)/i,
      /meeting number:?\s*([0-9\s-]+)/i,
      /id:?\s*([0-9\s-]+)/i,
      /conference id:?\s*([0-9\s-]+)/i,
    ];

    for (const pattern of meetingIdPatterns) {
      const match = meetingInfo.match(pattern);
      if (match) {
        result.meetingId = match[1].replace(/[\s-]/g, '');
        break;
      }
    }

    // Extract Password - flexible patterns
    const passwordPatterns = [
      /password:?\s*([a-zA-Z0-9]+)/i,
      /passcode:?\s*([a-zA-Z0-9]+)/i,
      /access code:?\s*([a-zA-Z0-9]+)/i,
      /pin:?\s*([a-zA-Z0-9]+)/i,
    ];

    for (const pattern of passwordPatterns) {
      const match = meetingInfo.match(pattern);
      if (match) {
        result.password = match[1];
        break;
      }
    }

    // Extract Date and Time - multiple approaches
    // First try to find explicit date/time information
    const timePatterns = [
      // "Time: April 27, 2024 2:00 PM - 3:00 PM"
      /time:?\s*(.*?)\s*-\s*(.*?)(?:\n|$)/i,

      // "Start: April 27, 2024 2:00 PM End: April 27, 2024 3:00 PM"
      /start:?\s*(.*?)(?:\s*end:?\s*|\n|$)(.*?)(?:\n|$)/i,

      // "April 27, 2024 2:00 PM - 3:00 PM"
      /((?:\w+\s+\d+,?\s+\d{4}|\d{1,2}\/\d{1,2}\/\d{2,4})\s+\d{1,2}[:\.]\d{2}\s*(?:am|pm)?)\s*-\s*((?:\w+\s+\d+,?\s+\d{4}|\d{1,2}\/\d{1,2}\/\d{2,4})?\s*\d{1,2}[:\.]\d{2}\s*(?:am|pm)?)/i,
    ];

    let startTimeFound = false,
      endTimeFound = false;

    for (const pattern of timePatterns) {
      const match = meetingInfo.match(pattern);
      if (match) {
        try {
          // For patterns with both start and end time
          if (match[2]) {
            const startStr = match[1].trim();
            let endStr = match[2].trim();

            // If end doesn't have date part but start does, use start's date
            if (
              endStr.match(/^\d{1,2}[:\.]\d{2}\s*(?:am|pm)?$/i) &&
              startStr.match(
                /(?:\w+\s+\d+,?\s+\d{4}|\d{1,2}\/\d{1,2}\/\d{2,4})/i
              )
            ) {
              const datePart = startStr.match(
                /(?:\w+\s+\d+,?\s+\d{4}|\d{1,2}\/\d{1,2}\/\d{2,4})/i
              )[0];
              endStr = `${datePart} ${endStr}`;
            }

            // Try to parse with different libraries and formats
            const startDate = this.tryParseDates(startStr);
            const endDate = this.tryParseDates(endStr);

            if (startDate && endDate) {
              result.startTime = startDate.toISOString();
              result.endTime = endDate.toISOString();
              startTimeFound = endTimeFound = true;
              break;
            }
          }
        } catch (error) {
          this.logger.warn(`Error parsing date/time: ${error.message}`);
          // Continue to the next pattern
        }
      }
    }

    // If we still don't have the times, look for any dates/times in the text
    if (!startTimeFound || !endTimeFound) {
      // Look for ISO dates
      const isoDatePattern =
        /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z?/g;
      const isoDates = meetingInfo.match(isoDatePattern);

      if (isoDates && isoDates.length >= 2) {
        // Sort them to determine start and end
        const sortedDates = isoDates
          .map(d => new Date(d))
          .sort((a, b) => a.getTime() - b.getTime());

        if (!startTimeFound) result.startTime = sortedDates[0].toISOString();
        if (!endTimeFound)
          result.endTime = sortedDates[sortedDates.length - 1].toISOString();
      } else {
        // Last resort: look for common date formats
        const datePattern =
          /(?:\d{1,2}\/\d{1,2}\/\d{2,4}|\w+\s+\d{1,2},?\s+\d{4}|\d{4}-\d{2}-\d{2})(?:\s+\d{1,2}[:\.]\d{2}(?::\d{2})?\s*(?:am|pm)?)?/gi;
        const dates = meetingInfo.match(datePattern);

        if (dates && dates.length >= 1) {
          const parsedDates = dates
            .map(d => this.tryParseDates(d))
            .filter(Boolean);

          if (parsedDates.length >= 1) {
            if (!startTimeFound) {
              result.startTime = parsedDates[0].toISOString();
              startTimeFound = true;
            }

            if (!endTimeFound && parsedDates.length >= 2) {
              result.endTime =
                parsedDates[parsedDates.length - 1].toISOString();
              endTimeFound = true;
            } else if (!endTimeFound) {
              // If only one date found, assume meeting is 1 hour
              const endDate = new Date(parsedDates[0].getTime());
              endDate.setHours(endDate.getHours() + 1);
              result.endTime = endDate.toISOString();
              endTimeFound = true;
            }
          }
        }
      }
    }

    // Add fallback for dates if we still couldn't parse them
    if (!startTimeFound) {
      this.logger.warn('Could not parse start time, using current time');
      const now = new Date();
      result.startTime = now.toISOString();
    }

    if (!endTimeFound) {
      this.logger.warn('Could not parse end time, using start time + 1 hour');
      const end = new Date(
        new Date(result.startTime).getTime() + 60 * 60 * 1000
      );
      result.endTime = end.toISOString();
    }

    return result;
  }

  private tryParseDates(dateStr: string): Date | null {
    const possibleFormats = [
      // Try direct Date parsing
      () => new Date(dateStr),

      // Try MM/DD/YYYY format
      () => {
        const match = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
        if (match) {
          const year = match[3].length === 2 ? `20${match[3]}` : match[3];
          return new Date(`${year}-${match[1]}-${match[2]}`);
        }
        return null;
      },

      // Try "Month DD, YYYY" format
      () => {
        const match = dateStr.match(/(\w+)\s+(\d{1,2}),?\s+(\d{4})/);
        if (match) {
          const monthNames = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',
          ];
          const month = monthNames.findIndex(m =>
            match[1].toLowerCase().includes(m.toLowerCase())
          );
          if (month !== -1) {
            return new Date(parseInt(match[3]), month, parseInt(match[2]));
          }
        }
        return null;
      },
    ];

    for (const format of possibleFormats) {
      try {
        const date = format();
        if (date && !isNaN(date.getTime())) {
          return date;
        }
      } catch (e) {
        // Continue to next format
      }
    }

    return null;
  }

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

  private calculateParsingConfidence(dto: SendMeetingDto, parsed: any): string {
    if (!dto.meetingInfo) return 'high'; // Not parsing

    let score = 0;
    if (parsed.meetingUrl) score += 40; // URL is most important
    if (parsed.meetingId) score += 20;
    if (parsed.password) score += 10;
    if (parsed.startTime) score += 15;
    if (parsed.endTime) score += 15;

    if (score >= 90) return 'high';
    if (score >= 60) return 'medium';
    return 'low';
  }

  private generateParsingWarnings(dto: SendMeetingDto, parsed: any): string[] {
    if (!dto.meetingInfo) return [];

    const warnings = [];

    if (!parsed.meetingUrl && !dto.meetingUrl)
      warnings.push(
        'No meeting URL could be detected. Please verify the meeting link is correct.'
      );

    if (!parsed.meetingId && !dto.meetingId)
      warnings.push(
        'No meeting ID was detected. This may be needed to join the meeting.'
      );

    if (!parsed.password && !dto.password)
      warnings.push(
        'No password was detected. If the meeting requires a password, please add it manually.'
      );

    if (
      new Date(parsed.startTime).getTime() ===
      new Date(parsed.endTime).getTime() - 3600000
    )
      warnings.push(
        'End time was estimated as 1 hour after start time. Please verify if this is correct.'
      );

    return warnings;
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
