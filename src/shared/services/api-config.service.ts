import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { School } from '../../admin/entities/school.entity';
import { Admin } from '../../admin/entities/admin.entity';
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
        Admin,
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
