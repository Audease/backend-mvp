import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { RolePermission } from './rolepermission.entity';
import { School } from './school.entity';
import { Workflow } from './workflow.entity';

@Entity('roles')
export class Roles {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 255 })
  role: string;

  @Column('text', { nullable: true })
  description: string;

  @OneToMany(() => RolePermission, rolePermission => rolePermission.role)
  rolePermission: RolePermission[];

  @ManyToOne(() => School, school => school.roles)
  @JoinColumn({ name: 'school_id' })
  school: School;

  @ManyToOne(() => Workflow, workflow => workflow.id)
  @JoinColumn({ name: 'workflow_id' })
  workflow: Workflow;

  @Column('enum', { enum: ['pending', 'completed'], default: 'pending' })
  onboarding_status?: string;

  @CreateDateColumn({
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
    name: 'created_at',
  })
  created_at: Date;

  @Column('boolean', { default: false })
  is_archived: boolean;

  @Column('timestamp', { nullable: true })
  archived_at: Date;

  @Column('varchar', { length: 255, nullable: true })
  archived_by: string;

  @Column('varchar', { length: 1000, nullable: true })
  archive_reason: string;

  @CreateDateColumn({
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
    name: 'updated_at',
  })
  updated_at: Date;
}
