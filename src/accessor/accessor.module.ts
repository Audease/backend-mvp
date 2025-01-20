import { Logger, Module } from '@nestjs/common';
import { AccessorService } from './accessor.service';
import { AccessorController } from './accessor.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProspectiveStudent } from '../recruiter/entities/prospective-student.entity';
import { Repository } from 'typeorm';
import { BksdModule } from '../bksd/bksd.module';
import { BksdRepository } from '../bksd/bksd.repository';
import { UsersModule } from '../users/users.module';
import { Accessor } from './entities/accessor.entity';
import { MailService } from '../shared/services/mail.service';
import { Student } from '../students/entities/student.entity';
import { FormSubmission } from '../form/entity/form-submission.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProspectiveStudent,
      Accessor,
      Student,
      FormSubmission,
    ]),
    BksdModule,
    UsersModule,
  ],
  controllers: [AccessorController],
  providers: [AccessorService, Repository, Logger, BksdRepository, MailService],
  exports: [AccessorService],
})
export class AccessorModule {}
