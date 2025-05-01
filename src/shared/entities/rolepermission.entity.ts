import { ManyToOne, Entity, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { Roles } from './role.entity';
import { Permissions } from './permission.entity';

@Entity('role_permission')
export class RolePermission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Roles, role => role.id, { cascade: true })
  @JoinColumn({ name: 'role_id' })
  role: Roles;

  @ManyToOne(() => Permissions, permission => permission.id, {
    cascade: true,
  })
  @JoinColumn({ name: 'permission_id' })
  permission: Permissions;
}
