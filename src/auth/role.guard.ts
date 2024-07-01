import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Role } from '../utils/enum/role';
import { Reflector } from '@nestjs/core';

import { ROLES_KEY } from '../shared/decorators/roles.decorator';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // if (!requiredRoles || requiredRoles.length === 0) {
    //   return true;
    // }
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;


    if (!user) {
      throw new ForbiddenException('User not found');
    }
    if (!user.role) {
      throw new ForbiddenException('User role not found');
    }
    if (!requiredRoles.some(role => user.role === role)) {
      throw new ForbiddenException(
        'You do not have the required role to perform this action'
      );
    }
    return true;
  }
}
