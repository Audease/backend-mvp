import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RolePermission } from './rolepermission.entity';

@Entity('permissions')
export class Permissions {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.permission)
  rolePermission: RolePermission[];

  @CreateDateColumn({
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
    name: 'created_at',
  })
  created_at: Date;

  @CreateDateColumn({
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
    name: 'updated_at',
  })
  updated_at: Date;
}