import { Logger, Module } from '@nestjs/common';
import { InductorService } from './inductor.service';
import { InductorController } from './inductor.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inductor } from './entities/inductor.entity';
import { ProspectiveStudent } from '../recruiter/entities/prospective-student.entity';
import { UsersModule } from '../users/users.module';
import { BksdModule } from '../bksd/bksd.module';
import { Repository } from 'typeorm';
import { BksdRepository } from '../bksd/bksd.repository';
import { Accessor } from '../accessor/entities/accessor.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Inductor, Accessor, ProspectiveStudent]),
    BksdModule,
    UsersModule,
  ],
  controllers: [InductorController],
  providers: [InductorService, Repository, Logger, BksdRepository],
  exports: [InductorService],
})
export class InductorModule {}
