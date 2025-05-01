import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CertificateService } from './certificate.service';
import { CertificateController } from './certificate.controller';
import { ProspectiveStudent } from '../recruiter/entities/prospective-student.entity';
import { BksdRepository } from '../bksd/bksd.repository';
import { UsersModule } from '../users/users.module';
import { Accessor } from '../accessor/entities/accessor.entity';
import { BksdModule } from '../bksd/bksd.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProspectiveStudent, Accessor]),
    UsersModule,
    BksdModule,
  ],
  controllers: [CertificateController],
  providers: [CertificateService, BksdRepository],
})
export class CertificateModule {}
