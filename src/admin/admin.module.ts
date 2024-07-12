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

@Module({
  imports: [
    TypeOrmModule.forFeature([School, Student, Users, Document, Roles]),
  ],
  controllers: [AdminController],
  providers: [
    AuthRepository,
    AdminRepository,
    Logger,
    UserService,
    AdminService,
    CloudinaryService,
  ],
})
export class AdminModule {}
