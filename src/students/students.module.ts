import { Module } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from './entities/student.entity';
import { StudentRepository } from './student.repository';
import { Document } from '../shared/entities/document.entity';
import { StorageService } from '../shared/services/cloud-storage.service';
import { UserService } from '../users/users.service';
import { Logger } from '@nestjs/common';
import { Users } from '../users/entities/user.entity';
import { Roles } from '../shared/entities/role.entity';
import { School } from '../shared/entities/school.entity';
import { Permissions } from '../shared/entities/permission.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Student,
      Document,
      Users,
      Roles,
      School,
      Permissions,
    ]),
  ],
  controllers: [StudentsController],
  providers: [
    StudentsService,
    Logger,
    StorageService,
    UserService,
    StudentRepository,
  ],
})
export class StudentsModule {}
