import { School } from '../../shared/entities/school.entity';
import { Users } from '../../users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProspectiveStudent } from './prospective-student.entity';

@Entity('recruiters')
export class Recruiter {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 255, nullable: false })
  first_name: string;

  @Column('varchar', { length: 255, nullable: false })
  last_name: string;

  @OneToOne(() => Users, user => user.recruiter)
  @JoinColumn({ name: 'user_id' })
  user: Users;

  @ManyToOne(() => School, school => school.recruiters)
  @JoinColumn({ name: 'school_id' })
  school: School;

  @OneToMany(() => ProspectiveStudent, applicants => applicants.recruiter)
  applicants: ProspectiveStudent[];

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
