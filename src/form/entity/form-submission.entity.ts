import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { SubmissionStatus } from '../../utils/enum/submission-status';
import { Users } from '../../users/entities/user.entity';
import { Form } from './form.entity';
import { ProspectiveStudent } from '../../recruiter/entities/prospective-student.entity';

@Entity('form_submissions')
export class FormSubmission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Form, form => form.submissions)
  @JoinColumn({ name: 'form_id' }) // explicitly specify the column name
  form: Form;

  @Column({
    type: 'enum',
    enum: SubmissionStatus,
    default: SubmissionStatus.DRAFT,
  })
  status: SubmissionStatus;

  @Column('jsonb')
  data: any;

  @Column({ default: false })
  is_submitted: boolean;

  @ManyToOne(
    () => ProspectiveStudent,
    prospectiveStudent => prospectiveStudent.submissions
  )
  @JoinColumn({ name: 'student_id' })
  student: ProspectiveStudent;

  @OneToMany(() => FormSubmission, submission => submission.student)
  submissions: FormSubmission[];

  @ManyToOne(() => Users, user => user.reviewedSubmissions, { nullable: true })
  @JoinColumn({ name: 'reviewer_id' })
  reviewer: Users;

  @Column({ name: 'review_comment' }) // explicitly map to the DB column name
  reviewComment: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
