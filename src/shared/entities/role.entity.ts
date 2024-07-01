import { Role } from '../../utils/enum/role';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { RolePermission } from './rolepermission.entity';
import { Users } from '../../users/entities/user.entity';

@Entity('roles')
export class Roles {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('enum', { enum: Role, default: Role.NONE })
  role: Role;

  @Column('text', { nullable: true })
  description: string;

  @OneToMany(() => RolePermission, rolePermission => rolePermission.role)
  rolePermission: RolePermission[];

  @OneToMany(() => Users, user => user.role)
  user: Users[];

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
