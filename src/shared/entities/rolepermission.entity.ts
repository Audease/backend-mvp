import { Column, ManyToOne } from "typeorm";
import { Roles } from "./role.entity";
import { Permissions } from "./permission.entity";

export class RolePermission {
  @ManyToOne(() => Roles, (role) => role.id, { cascade: true})
  role: Roles;

  @ManyToOne(() => Permissions, (permission) => permission.id, { cascade: true })
  permission: Permissions;
}