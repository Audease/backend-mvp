import { ManyToOne, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Roles } from './role.entity';
import { Permissions } from './permission.entity';

@Entity('role_permission')
export class RolePermission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Roles, role => role.id, { cascade: true })
  role: Roles;

  @ManyToOne(() => Permissions, permission => permission.id, {
    cascade: true,
  })
  permission: Permissions;
}
