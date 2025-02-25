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

  @ManyToOne(() => Folder, folder => folder.childFolders)
  @JoinColumn({ name: 'parentFolderId' })
  parentFolder: Folder;

  @OneToMany(() => Folder, folder => folder.parentFolder, { cascade: true })
  childFolders: Folder[];

  @OneToMany(() => Document, document => document.folder, { cascade: true })
  documents: Document[];

  @CreateDateColumn()
  createdAt: Date;
}
