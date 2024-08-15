import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { School } from './school.entity';

@Entity('staff')
export class Staff {
  @PrimaryGeneratedColumn()
  id: string;

  @Column('varchar', { length: 255 })
  username: string;

  @Column('varchar', { length: 255 })
  email: string;

  @Column('enum', { enum: ['assigned', 'unassigned'], default: 'unassigned' })
  status: string;

  @ManyToOne(() => School, school => school.staff)
  @JoinColumn({ name: 'school_id' })
  school: School;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @CreateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
