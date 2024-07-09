import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Users } from '../../users/entities/user.entity';

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Users, user => user.documents)
  @JoinColumn({ name: 'user_id' })
  user: Users;

  @Column('varchar', { length: 255, nullable: false })
  fileName: string;

  @Column('varchar', { length: 255, nullable: false })
  fileType: string;

  @Column('varchar', { length: 255, nullable: false })
  cloudinaryUrl: string;

  @CreateDateColumn({
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
    name: 'uploaded_at',
  })
  uploadedAt: Date;
}
