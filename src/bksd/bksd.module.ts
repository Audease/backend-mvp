import { Logger, Module } from '@nestjs/common';
import { BksdService } from './bksd.service';
import { BksdController } from './bksd.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProspectiveStudent } from '../recruiter/entities/prospective-student.entity';
import { Users } from '../users/entities/user.entity';
import { Accessor } from '../accessor/entities/accessor.entity';
import { UsersModule } from '../users/users.module';
import { Repository } from 'typeorm';
import { Student } from '../students/entities/student.entity';
import { MailService } from '../shared/services/mail.service';
import { BksdRepository } from './bksd.repository';
import { UsernameGeneratorService } from '../shared/services/username-generator.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Users, Accessor, ProspectiveStudent, Student]),
    UsersModule,
  ],
  controllers: [BksdController],

  providers: [
    BksdService,
    Repository,
    Logger,
    MailService,
    BksdRepository,
    UsernameGeneratorService,
  ],
  exports: [BksdService, BksdRepository],
})
export class BksdModule {}
