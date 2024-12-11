import { School } from '../../shared/entities/school.entity';

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { Users } from '../../users/entities/user.entity';
import { FormSubmission } from '../../form/entity/form-submission.entity';

@Entity('prospective_students')
export class ProspectiveStudent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 255, nullable: false })
  name: string;

  @Column('date', { nullable: false })
  date_of_birth: string;

  @Column('varchar', { length: 255, nullable: true })
  mobile_number: string;

  @Column('varchar', { length: 255, nullable: true })
  email: string;

  @Column('varchar', { length: 255, nullable: true })
  NI_number: string;

  @Column('varchar', { length: 255, nullable: true })
  passport_number: string;

  @Column('varchar', { length: 255, nullable: true })
  home_address: string;

  @Column('varchar', { length: 255, nullable: true })
  funding: string;

  @Column('integer', { nullable: true })
  level: number;

  @Column('varchar', { length: 255, nullable: true })
  awarding: string;

  @Column('varchar', { length: 255, nullable: true })
  chosen_course: string;

  @OneToMany(() => FormSubmission, submission => submission.student)
  submissions: FormSubmission[];

  @Column('varchar', { length: 255, nullable: true, default: 'Not sent' })
  application_mail: string;

  @Column('enum', { enum: ['pending', 'completed'], default: 'pending' })
  onboarding_status?: string;

  @ManyToOne(() => Users, user => user.prospectiveStudents)
  @JoinColumn({ name: 'user_id' })
  user?: Users;

  @ManyToOne(() => School, school => school.applicants)
  @JoinColumn({ name: 'school_id' })
  school: School;

  @CreateDateColumn({
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
    name: 'created_at',
  })
  created_at: Date;

  @CreateDateColumn({
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
    name: 'updated_at',
  })
  updated_at: Date;

  @Column('varchar', { length: 255, nullable: true, default: 'Pending' })
  application_status: string;
}
