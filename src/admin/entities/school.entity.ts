import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Admin } from './admin.entity';

@Entity('colleges')
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

  @OneToOne(() => Admin, (admin) => admin.college)
  @JoinColumn()
  admin: Admin;

  @CreateDateColumn({
    type: 'timestamp',
  })
  createdAt: Date;
}
