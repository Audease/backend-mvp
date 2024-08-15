import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { LogType } from '../../utils/enum/log_type';
import { LogFolder } from './folder.entity';

@Entity('app_logs')
export class AppLogger {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  userId: string;

  @Column('varchar', { length: 255, nullable: false })
  message: string;

  @Column('varchar', { length: 255, nullable: false })
  type: string;

  @Column('varchar', { length: 255, nullable: false })
  method: string;

  @Column('varchar', { length: 255, nullable: false })
  route: string;

  @Column({
    type: 'enum',
    enum: LogType,
    default: LogType.ONE_TIME,
  })
  logType: LogType;

  @Column({ nullable: true })
  deletedAt: Date;

  @ManyToOne(() => LogFolder, { nullable: true })
  @JoinColumn({ name: 'folder_id' })
  folder: LogFolder;

  @CreateDateColumn({
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
    name: 'createdAt',
  })
  createdAt: Date;
}
