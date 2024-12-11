import {
  ManyToOne,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  JoinColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { Roles } from '../../shared/entities/role.entity';
import { School } from '../../shared/entities/school.entity';
import { Student } from '../../students/entities/student.entity';
import { FinancialAidOfficer } from '../../financial-aid-officer/entities/financial-aid-officer.entity';
import { Document } from '../../shared/entities/document.entity';
import { ProspectiveStudent } from '../../recruiter/entities/prospective-student.entity';
import { Recruiter } from '../../recruiter/entities/recruiter.entity';
import { FormSubmission } from '../../form/entity/form-submission.entity';

@Entity('users')
export class Users {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 255, nullable: false })
  first_name: string;

  @Column('varchar', { length: 255, nullable: false })
  last_name: string;

  @Column('varchar', { length: 255, nullable: false })
  username: string;

  @Column('varchar', { length: 255, nullable: false, unique: true })
  email: string;

  @Column('varchar', { length: 255, nullable: false })
  password: string;

  @Column('boolean', { nullable: false })
  '2fa_required': boolean;

  @Column('boolean', { nullable: false })
  is_active: boolean;

  @Column('varchar', { length: 255, nullable: false })
  phone: string;

  @OneToMany(() => FormSubmission, submission => submission.reviewer)
  reviewedSubmissions: FormSubmission[];

  @ManyToOne(() => Roles, role => role.id)
  @JoinColumn({ name: 'role_id' })
  role: Roles;

  @ManyToOne(() => School, school => school.users)
  @JoinColumn({ name: 'school_id' })
  school: School;

  @OneToOne(() => Recruiter, recruiter => recruiter.user)
  recruiter: Recruiter;

  @OneToMany(
    () => ProspectiveStudent,
    prospectiveStudent => prospectiveStudent.user
  )
  prospectiveStudents?: ProspectiveStudent[];

  @OneToOne(() => Student, student => student.user)
  student: Student;

  @OneToOne(
    () => FinancialAidOfficer,
    financialAidOfficer => financialAidOfficer.user
  )
  financialAidOfficer: FinancialAidOfficer;

  @OneToMany(() => Document, document => document.user)
  documents: Document[];

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

  @Column({ type: 'timestamp', nullable: true })
  expiration_date: Date;
}
