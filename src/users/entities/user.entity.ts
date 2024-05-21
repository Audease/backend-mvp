import {
  OneToOne,
  ManyToOne,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
import { Roles } from '../../shared/entities/role.entity';
import { School } from '../../shared/entities/school.entity';

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

  @OneToOne(() => Roles, (role) => role.id, { cascade: true })
  role: Roles;

  @ManyToOne(() => School, (school) => school.users)
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
