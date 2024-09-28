import { School } from '../../shared/entities/school.entity';
import { Users } from '../../users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 255, nullable: false })
  name: string;

  @Column('varchar', { length: 255, nullable: true })
  date_of_birth?: string;

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

  // @Column('enum', { enum: ['pending', 'completed'], default: 'pending' })
  // onboarding_status?: string;

  @OneToOne(() => Users, user => user.student)
  @JoinColumn({ name: 'user_id' })
  user: Users;

  @ManyToOne(() => School, school => school.students)
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

  @Column('varchar', { length: 255, nullable: true, default: 'Not completed' })
  course_status: string;

  @Column('varchar', { length: 255, nullable: true, default: 'Pending' })
  application_status: string;
}
