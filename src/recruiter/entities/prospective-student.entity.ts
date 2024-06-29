import { School } from '../../shared/entities/school.entity';

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Recruiter } from './recruiter.entity';


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

  @Column('number', { nullable: true })
  NI_number: number;

  @Column('number', { nullable: true })
  passport_number: number;

  @Column('varchar', { length: 255, nullable: true })
  home_address: string;

  @Column('varchar', { length: 255, nullable: true })
  funding: string;

  @Column('number', { nullable: true })
  level: number;

  @Column('varchar', { length: 255, nullable: true })
  awarding: string;

  @Column('varchar', { length: 255, nullable: true })
  chosen_course: string;

  @ManyToOne(() => Recruiter, recruiter => recruiter.applicants)
  @JoinColumn({ name: 'recruiter_id'})
  recruiter: Recruiter;

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
}
