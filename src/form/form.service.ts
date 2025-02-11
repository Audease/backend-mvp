import { Form } from './entity/form.entity';
import { FormSubmission } from './entity/form-submission.entity';
import { Repository } from 'typeorm';
import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateSubmissionDto } from './dto/create-submission.entity';
import { UpdateSubmissionDto } from './dto/update-submission.entity';
import { ReviewSubmissionDto } from './dto/review-submission.entity';
import { SubmissionStatus } from '../utils/enum/submission-status';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from '../users/users.service';
import { ProspectiveStudent } from '../recruiter/entities/prospective-student.entity';
import { Logger } from '@nestjs/common';
import { isUUID } from 'class-validator';

@Injectable()
export class FormService {
  private readonly logger = new Logger(FormService.name);
  constructor(
    @InjectRepository(FormSubmission)
    private submissionRepo: Repository<FormSubmission>,
    @InjectRepository(Form)
    private formRepo: Repository<Form>,
    private userService: UserService,
    @InjectRepository(ProspectiveStudent)
    private student: Repository<ProspectiveStudent>
  ) {}

  async createSubmission(dto: CreateSubmissionDto) {
    // Check if form template exists and is active
    const form = await this.formRepo.findOne({
      where: { type: dto.formType, is_active: true },
    });

    if (!form) {
      throw new NotFoundException('Form template not found');
    }

    // Check if student exists
    const student = await this.student.findOne({
      where: { id: dto.studentId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const submission = this.submissionRepo.create({
      form,
      student,
      data: dto.data,
      status: SubmissionStatus.DRAFT,
    });

    await this.submissionRepo.save(submission);

    return {
      id: submission.id,
      studentId: submission.student.id,
      message: 'Form Draft Created',
    };
  }

  async getAllStudentForms(studentId: string): Promise<Record<string, any>> {
    // Include both form and student relations
    const submissions = await this.submissionRepo.find({
      where: {
        student: { id: studentId },
      },
      relations: ['form'], // We don't need student relation since we have the ID
    });

    // Check for empty submissions array
    if (submissions.length === 0) {
      throw new NotFoundException('No submissions found for this student');
    }

    const isSubmitted = submissions.some(submission => submission.is_submitted);

    // Transform into object with form types as keys
    const formData = {
      is_submitted: isSubmitted,
    };
    submissions.forEach(submission => {
      formData[submission.form.type] = {
        id: submission.id,
        studentId: studentId,
        formType: submission.form.type,
        status: submission.status,
        data: submission.data,
        createdAt: submission.created_at,
        updatedAt: submission.updated_at,
        reviewerId: submission.reviewer?.id,
        reviewComment: submission.reviewComment,
      };
    });

    return formData;
  }

  async updateDraft(id: string, dto: UpdateSubmissionDto) {
    try {
      // Validate submission ID format
      if (!isUUID(id)) {
        throw new BadRequestException('Invalid submission ID format');
      }

      // Find submission by id
      const submission = await this.submissionRepo
        .findOne({
          where: {
            id,
          },
          relations: ['form', 'student'],
        })
        .catch(error => {
          this.logger.error(`Database query error: ${error.message}`);
          throw new InternalServerErrorException(
            'Error accessing the database'
          );
        });

      if (!submission) {
        throw new NotFoundException(`No submission found with ID: ${id}`);
      }

      // Validate submission is in draft status
      // if (submission.status !== SubmissionStatus.DRAFT) {
      //   throw new BadRequestException(
      //     `Cannot update submission with status: ${submission.status}`
      //   );
      // }

      // Validate input data
      if (!dto.data || typeof dto.data !== 'object') {
        throw new BadRequestException('Invalid data format provided');
      }

      try {
        // Check if current data has nested data structure
        const hasNestedData = submission.data && 'data' in submission.data;

        // Prepare new data based on structure
        let updatedData;
        if (hasNestedData) {
          updatedData = {
            data: {
              ...submission.data.data,
              ...dto.data,
            },
          };
        } else {
          updatedData = {
            ...submission.data,
            ...dto.data,
          };
        }

        // Update submission
        submission.data = updatedData;

        // Save changes
        const updatedSubmission = await this.submissionRepo.save(submission);

        return {
          id: updatedSubmission.id,
          formType: updatedSubmission.form.type,
          studentId: updatedSubmission.student.id,
          status: updatedSubmission.status,
          data: updatedSubmission.data,
          updatedAt: updatedSubmission.updated_at,
          message: 'Form Draft Updated Successfully',
        };
      } catch (error) {
        this.logger.error(`Error updating submission data: ${error.message}`);
        throw new InternalServerErrorException(
          'Failed to update submission data'
        );
      }
    } catch (error) {
      // Log the error
      this.logger.error(`Error in updateDraft: ${error.message}`);

      // Rethrow HTTP exceptions
      if (error instanceof HttpException) {
        throw error;
      }

      // Handle unexpected errors
      throw new InternalServerErrorException(
        'An unexpected error occurred while updating the draft'
      );
    }
  }

  async submitForm(studentId: string) {
    const submissions = await this.submissionRepo.find({
      where: {
        student: { id: studentId },
        status: SubmissionStatus.DRAFT,
      },
      relations: ['form'],
    });

    if (submissions.length === 0) {
      throw new NotFoundException(
        'No draft submissions found for this student'
      );
    }

    // Update all draft submissions to submitted
    const updatedSubmissions = await Promise.all(
      submissions.map(async submission => {
        submission.status = SubmissionStatus.SUBMITTED;
        submission.is_submitted = true;
        return this.submissionRepo.save(submission);
      })
    );

    return {
      message: 'All draft forms successfully submitted',
      learnerId: studentId,
      submissions: updatedSubmissions.map(submission => ({
        id: submission.id,
        formType: submission.form.type,
        status: submission.status,
        data: submission.data,
        createdAt: submission.created_at,
        updatedAt: submission.updated_at,
      })),
    };
  }

  async reviewSubmission(
    id: string,
    dto: ReviewSubmissionDto,
    reviewerId: string
  ): Promise<FormSubmission> {
    const submission = await this.submissionRepo.findOne({
      where: { id, status: SubmissionStatus.SUBMITTED },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    const reviewer = await this.userService.findOne(reviewerId);

    submission.status = dto.status;
    submission.reviewer = reviewer;
    submission.reviewComment = dto.comment;

    await this.submissionRepo.save(submission);

    return submission;
  }

  async getUserSubmissions(userId: string): Promise<FormSubmission[]> {
    return this.submissionRepo.find({
      where: { student: { id: userId } },
      order: { created_at: 'DESC' },
    });
  }
}
