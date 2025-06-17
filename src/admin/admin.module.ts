import { Student } from '../students/entities/student.entity';
import { School } from '../shared/entities/school.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Logger, Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthRepository } from '../auth/auth.repository';
import { AdminRepository } from './admin.repository';
import { UserService } from '../users/users.service';
import { Users } from '../users/entities/user.entity';
import { Document } from '../shared/entities/document.entity';
import { Roles } from '../shared/entities/role.entity';
import { AdminController } from './admin.controller';
import { StorageService } from '../shared/services/cloud-storage.service';
import { LogService } from '../shared/services/logger.service';
import { AppLogger } from '../shared/entities/logger.entity';
import { MailService } from '../shared/services/mail.service';
import { ProspectiveStudent } from '../recruiter/entities/prospective-student.entity';
import { Permissions } from '../shared/entities/permission.entity';
import { RolePermission } from '../shared/entities/rolepermission.entity';
import { LogFolder } from '../shared/entities/folder.entity';
import { Staff } from '../shared/entities/staff.entity';
import { Workflow } from '../shared/entities/workflow.entity';
import { Folder } from '../shared/entities/file-folder.entity';
import { UsernameGeneratorService } from '../shared/services/username-generator.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      School,
      Student,
      Users,
      Document,
      Roles,
      AppLogger,
      ProspectiveStudent,
      Roles,
      Permissions,
      RolePermission,
      LogFolder,
      Staff,
      Workflow,
      Folder,
    ]),
  ],
  controllers: [AdminController],
  providers: [
    AuthRepository,
    AdminRepository,
    Logger,
    UserService,
    AdminService,
    StorageService,
    LogService,
    MailService,
    UsernameGeneratorService,
  ],
})
export class AdminModule {}
