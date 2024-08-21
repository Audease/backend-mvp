import { Logger, Module } from '@nestjs/common';
import { AuditorService } from './auditor.service';
import { AuditorController } from './auditor.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from '../students/entities/student.entity';
import { BksdModule } from '../bksd/bksd.module';
import { UsersModule } from '../users/users.module';
import { Repository } from 'typeorm'
import { AuditorRepository } from './auditor.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Student]), BksdModule, UsersModule],
  controllers: [AuditorController],
  providers: [
    AuditorService,
    Repository,
    Logger,
    AuditorRepository,
  ],
  exports: [AuditorService],
})
export class AuditorModule {}
