import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
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
  school: School;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @CreateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
