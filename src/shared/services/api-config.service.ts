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
import { Accessor } from '../../accessor/entities/accessor.entity';
import { Document } from '../entities/document.entity';
import { AppLogger } from '../entities/logger.entity';
import { Staff } from '../entities/staff.entity';
import { Inductor } from '../../inductor/entities/inductor.entity';
import { LogFolder } from '../entities/folder.entity';
import { Workflow } from '../entities/workflow.entity';
import { Form } from '../../form/entity/form.entity';
import { FormSubmission } from '../../form/entity/form-submission.entity';

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
        Accessor,
        Document,
        AppLogger,
        LogFolder,
        Inductor,
        Staff,
        Workflow,
        Form,
        FormSubmission,
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
