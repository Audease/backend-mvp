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
import { CloudinaryService } from '../shared/services/cloudinary.service';
import { LogService } from '../shared/services/logger.service';
import { AppLogger } from '../shared/entities/logger.entity';
import { MailService } from '../shared/services/mail.service';
import { ProspectiveStudent } from '../recruiter/entities/prospective-student.entity';

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
    ]),
  ],
  controllers: [AdminController],
  providers: [
    AuthRepository,
    AdminRepository,
    Logger,
    UserService,
    AdminService,
    CloudinaryService,
    LogService,
    MailService,
  ],
})
export class AdminModule {}
