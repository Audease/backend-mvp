import { Module } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from './entities/student.entity';
import { StudentRepository } from './student.repository';
import { Document } from '../shared/entities/document.entity';
import { CloudinaryService } from '../shared/services/cloudinary.service';
import { UserService } from '../users/users.service';
import { Logger } from '@nestjs/common';
import { Users } from '../users/entities/user.entity';
import { Roles } from '../shared/entities/role.entity';
import { School } from '../shared/entities/school.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Student, Document, Users, Roles, School]),
  ],
  controllers: [StudentsController],
  providers: [
    StudentsService,
    Logger,
    CloudinaryService,
    UserService,
    StudentRepository,
  ],
})
export class StudentsModule {}
