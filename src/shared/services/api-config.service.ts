import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { School } from '../entities/school.entity';
import { Users } from '../../users/entities/user.entity';
import { Roles } from '../entities/role.entity';
import { RolePermission } from '../entities/rolepermission.entity';
import { Permissions } from '../entities/permission.entity';
import { Token } from '../entities/token.entity';
import { Recruiter } from '../../recruiter/entities/recruiter.entity';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';
import type { dbConfigs } from '../types/dbConfig';
import { FinancialAidOfficer } from '../../financial-aid-officer/entities/financial-aid-officer.entity';
import { Student } from '../../students/entities/student.entity';
import { ProspectiveStudent } from '../../recruiter/entities/prospective-student.entity';

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
        Token,
        Recruiter,
        FinancialAidOfficer,
        Student,
        ProspectiveStudent,
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
