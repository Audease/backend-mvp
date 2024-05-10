import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToOne,
} from 'typeorm';
import { School } from './school.entity';
import { Role } from '../../utils/enum/role';

@Entity('admins')
export class Admin {
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

  @Column('enum', { enum: Role, nullable: false })
  role: Role.COLLEGE_ADMIN;

  @OneToOne(() => School, (school) => school.admin)
  college: School;

  @CreateDateColumn()
  createdAt: Date;
}
