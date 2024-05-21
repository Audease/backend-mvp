import { Role } from '../../utils/enum/role';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Users } from '../../users/entities/user.entity';
import { RolePermission } from './rolepermission.entity';

@Entity('roles')
export class Roles {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('enum', { enum: Role, default: Role.NONE })
  role: Role;

  @Column('text', { nullable: true })
  description: string;

  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.role)
  rolePermission: RolePermission[];

  @OneToOne(() => Users, (user) => user.role)
  @JoinColumn()
  user: Users;

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
