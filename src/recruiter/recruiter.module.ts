import { Logger, Module } from '@nestjs/common';
import { RecruiterService } from './recruiter.service';
import { RecruiterController } from './recruiter.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProspectiveStudent } from './entities/prospective-student.entity';
import { Repository } from 'typeorm';
import { Users } from '../users/entities/user.entity';
import { Recruiter } from './entities/recruiter.entity';
import { RecruiterRepository } from './recruiter.repository';
import { CSVProcessorService } from '../shared/services/csv-processor.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProspectiveStudent, Users, Recruiter])],
  controllers: [RecruiterController],
  providers: [
    RecruiterService,
    Repository,
    Logger,
    RecruiterRepository,
    CSVProcessorService,
  ],
  exports: [RecruiterService],
})
export class RecruiterModule {}
