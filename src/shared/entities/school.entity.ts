import { RegistrationStatus } from '../../utils/enum/registration_status';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Users } from '../../users/entities/user.entity';

@Entity('school')
export class School {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 255, nullable: false, unique: true })
  name: string;

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
  state: string;

  @Column({
    type: 'enum',
    enum: RegistrationStatus,
    default: RegistrationStatus.IN_PROGRESS,
  })
  status: RegistrationStatus;

  @OneToMany(() => Users, (users) => users.school)
  users: Users[];

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
