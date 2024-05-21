import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { School } from '../../shared/entities/school.entity';
import { Users } from '../../users/entities/user.entity';
import { Roles } from '../entities/role.entity';
import { RolePermission } from '../entities/rolepermission.entity';
import { Permissions } from '../entities/permission.entity';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';
import type { dbConfigs } from '../types/dbConfig';

@Injectable()
export class ApiConfigService {
  constructor(private configService: ConfigService) {}
  get TypeormConfig(): TypeOrmModuleOptions {
    const dbParams = this.configService.get<dbConfigs>('database');

    const { username, password, database, host, port }: dbConfigs = dbParams;

    return {
      type: 'postgres',
      migrations: [],
      entities: [
        School,
        Users,
        Roles,
        RolePermission,
        Permissions,
      ],
      migrationsRun: true,
      username,
      password,
      database,
      host,
      port,
    };
  }
}
