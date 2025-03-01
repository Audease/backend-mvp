import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Users } from '../../users/entities/user.entity';
import { School } from './school.entity';
import { Folder } from './file-folder.entity';
import { ProspectiveStudent } from '../../recruiter/entities/prospective-student.entity';

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Users, user => user.documents)
  @JoinColumn({ name: 'userId' })
  user: Users;

  @Column('varchar', { length: 255, nullable: false })
  fileName: string;

  @Column('varchar', { length: 255, nullable: false })
  fileType: string;

  @Column('varchar', { length: 255, nullable: false })
  publicUrl: string;

  @ManyToOne(() => School, school => school.documents)
  @JoinColumn({ name: 'school_id' })
  school: School;

  @ManyToOne(() => Folder, folder => folder.documents)
  @JoinColumn({ name: 'folderId' })
  folder: Folder;

  @ManyToOne(() => ProspectiveStudent, student => student.documents)
  @JoinColumn({ name: 'studentId' })
  student: ProspectiveStudent;

  @Column({ nullable: true })
  folderId: string;

  @Column('enum', { enum: ['pending', 'completed'], default: 'pending' })
  onboarding_status?: string;

  @CreateDateColumn({
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
    name: 'uploadedAt',
  })
  uploadedAt: Date;
}
