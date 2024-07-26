import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { AppLogger } from './logger.entity';

@Entity('log_folders')
export class LogFolder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Index()
  @Column()
  userId: string;

  @OneToMany(() => AppLogger, log => log.folder)
  logs: AppLogger[];

  @CreateDateColumn()
  createdAt: Date;
}
