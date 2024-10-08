import { RegistrationStatus } from '../../utils/enum/registration_status';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Users } from '../../users/entities/user.entity';
import { Recruiter } from '../../recruiter/entities/recruiter.entity';
import { FinancialAidOfficer } from '../../financial-aid-officer/entities/financial-aid-officer.entity';
import { Student } from '../../students/entities/student.entity';
import { ProspectiveStudent } from '../../recruiter/entities/prospective-student.entity';
import { Roles } from './role.entity';
import { Document } from './document.entity';
import { Staff } from './staff.entity';
import { Workflow } from './workflow.entity';

@Entity('school')
export class School {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 255, nullable: false, unique: true })
  college_name: string;

  @Column('integer', { nullable: false })
  no_of_employee: number;

  @Column('varchar', { length: 255, nullable: false })
  country: string;

  @Column('varchar', { length: 10, nullable: false })
  business_code: string;

  @Column('varchar', { length: 255, nullable: false })
  address_line1: string;

  @Column('varchar', { length: 255, nullable: true })
  address_line2: string;

  @Column('varchar', { length: 255, nullable: false })
  city: string;

  @Column('varchar', { length: 255, nullable: false })
  post_code: string;

  @Column('varchar', { length: 255, nullable: false })
  county: string;

  @Column({
    type: 'enum',
    enum: RegistrationStatus,
    default: RegistrationStatus.IN_PROGRESS,
  })
  status: RegistrationStatus;

  @OneToMany(() => Users, users => users.school)
  users: Users[];

  @OneToMany(() => Recruiter, recruiters => recruiters.school)
  recruiters: Recruiter[];

  @OneToMany(() => ProspectiveStudent, applicants => applicants.school)
  applicants: ProspectiveStudent[];

  @OneToMany(() => Roles, roles => roles.school)
  roles: Roles[];

  @OneToMany(() => Workflow, workflows => workflows.school)
  workflows: Workflow[];

  @OneToMany(() => Document, documents => documents.school)
  documents: Document[];

  @OneToMany(
    () => FinancialAidOfficer,
    financialAidOfficers => financialAidOfficers.school
  )
  financialAidOfficers: FinancialAidOfficer[];

  @OneToMany(() => Student, students => students.school)
  students: Student[];

  @OneToMany(() => Staff, staff => staff.school)
  staff: Staff[];

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
