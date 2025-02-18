import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  OneToMany,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Document } from './document.entity';

@Entity('folders')
export class Folder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Index()
  @Column()
  userId: string;

  @Column({ nullable: true })
  parentFolderId: string;

  @OneToMany(() => Document, document => document.folder)
  documents: Document[];

  @ManyToOne(() => Folder, folder => folder.subFolders)
  @JoinColumn({ name: 'parentFolderId' })
  parentFolder: Folder;

  @OneToMany(() => Folder, folder => folder.parentFolder)
  subFolders: Folder[];

  @CreateDateColumn()
  createdAt: Date;
}
