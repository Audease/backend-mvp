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

@Module({
  imports: [TypeOrmModule.forFeature([Student, Document])],
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
