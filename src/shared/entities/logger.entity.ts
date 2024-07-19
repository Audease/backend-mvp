import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { LogType } from '../../utils/enum/log_type';

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

  @CreateDateColumn({
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
    name: 'createdAt',
  })
  createdAt: Date;
}
