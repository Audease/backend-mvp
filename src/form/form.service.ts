import { Form } from './entity/form.entity';
import { FormSubmission } from './entity/form-submission.entity';
import { Repository } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSubmissionDto } from './dto/create-submission.entity';
import { UpdateSubmissionDto } from './dto/update-submission.entity';
import { ReviewSubmissionDto } from './dto/review-submission.entity';
import { SubmissionStatus } from '../utils/enum/submission-status';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from '../users/users.service';

@Injectable()
export class FormService {
  constructor(
    @InjectRepository(FormSubmission)
    private submissionRepo: Repository<FormSubmission>,
    @InjectRepository(Form)
    private formRepo: Repository<Form>,
    private userService: UserService
  ) {}

  async createDraft(dto: CreateSubmissionDto, userId: string) {
    const form = await this.formRepo.findOne({
      where: { type: dto.formType, is_active: true },
    });

    if (!form) {
      throw new NotFoundException('Form template not found');
    }

    const user = await this.userService.findOne(userId);

    const submission = this.submissionRepo.create({
      form,
      student: user,
      data: dto.data,
      status: SubmissionStatus.DRAFT,
    });

    await this.submissionRepo.save(submission);

    return {
      message: 'Form Draft Created',
    };
  }

  async updateDraft(id: string, dto: UpdateSubmissionDto, userId: string) {
    const submission = await this.submissionRepo.findOne({
      where: { id, student: { id: userId }, status: SubmissionStatus.DRAFT },
    });

    if (!submission) {
      throw new NotFoundException('Draft submission not found');
    }

    submission.data = { ...submission.data, ...dto.data };
    return this.submissionRepo.save(submission);
  }

  async submitForm(id: string, userId: string) {
    const submission = await this.submissionRepo.findOne({
      where: { student: { id: userId }, status: SubmissionStatus.SUBMITTED },
    });

    if (!submission) {
      throw new NotFoundException('Draft submission not found');
    }

    submission.status = SubmissionStatus.SUBMITTED;
    await this.submissionRepo.save(submission);

    return submission;
  }

  async getSubmission(id: string, userId: string): Promise<FormSubmission> {
    const submission = await this.submissionRepo.findOne({
      where: [
        { id, student: { id: userId } },
        { id, reviewer: { id: userId } },
      ],
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    return submission;
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
