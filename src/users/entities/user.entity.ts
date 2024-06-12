import {
  ManyToOne,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { Roles } from '../../shared/entities/role.entity';
import { School } from '../../shared/entities/school.entity';
import { Recruiter } from '../../recruiter/entities/recruiter.entity';
import { Student } from '../../students/entities/student.entity'
import { FinancialAidOfficer } from '../../financial-aid-officer/entities/financial-aid-officer.entity';


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

  @Column('varchar', { length: 255, nullable: false })
  phone: string;

  @ManyToOne(() => Roles, role => role.id)
  @JoinColumn({ name: 'role_id' })
  role: Roles;

  @ManyToOne(() => School, school => school.users)
  @JoinColumn({ name: 'school_id' })
  school: School;

  @OneToOne(() => Recruiter, recruiter => recruiter.user)
  recruiter: Recruiter;

  @OneToOne(() => Student, student => student.user)
  student: Student;

  
@OneToOne(() => FinancialAidOfficer, financialAidOfficer => financialAidOfficer.user)
financialAidOfficer: FinancialAidOfficer;

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
