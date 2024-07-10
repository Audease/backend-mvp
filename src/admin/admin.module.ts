import { Student } from '../students/entities/student.entity';
import { School } from '../shared/entities/school.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Logger, Module } from '@nestjs/common';
import { AuthRepository } from '../auth/auth.repository';
import { AdminRepository } from './admin.repository';
import { UserService } from '../users/users.service';
import { Users } from '../users/entities/user.entity';
import { Document } from '../shared/entities/document.entity';
import { Roles } from '../shared/entities/role.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([School, Student, Users, Document, Roles]),
  ],
  controllers: [],
  providers: [AuthRepository, AdminRepository, Logger, UserService],
})
export class AdminModule {}
