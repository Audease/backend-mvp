import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { FormType } from '../../utils/enum/form-type';
import { FormSubmission } from './form-submission.entity';

@Entity('forms')
export class Form {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: FormType,
  })
  type: FormType;

  @Column()
  title: string;

  @Column('jsonb', { nullable: true })
  metadata: any;

  @Column({ default: true })
  is_active: boolean;

  @OneToMany(() => FormSubmission, submission => submission.form)
  submissions: FormSubmission[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
