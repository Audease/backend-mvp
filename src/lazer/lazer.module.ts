import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LazerController } from './lazer.controller';
import { LazerService } from './lazer.service';
import { ProspectiveStudent } from '../recruiter/entities/prospective-student.entity';
import { BksdRepository } from '../bksd/bksd.repository';
import { UsersModule } from '../users/users.module';
import { BksdModule } from '../bksd/bksd.module';
import { Accessor } from '../accessor/entities/accessor.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProspectiveStudent, Accessor]),
    UsersModule,
    BksdModule,
  ],
  controllers: [LazerController],
  providers: [LazerService, BksdRepository],
})
export class LazerModule {}
