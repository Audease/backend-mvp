import { Module } from '@nestjs/common';
import { CollegeVerificationController } from './college-verification.controller';
import { CollegeVerificationService } from './college-verification.service';
import { MailService } from '../shared/services/mail.service';
import { AuthRepository } from '../auth/auth.repository';
import { RedisService } from '../shared/services/redis.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { School } from '../shared/entities/school.entity';
import { UsersModule } from '../users/users.module';
import { RedisModule } from '../shared/module/redis.module';
import { ProspectiveStudent } from '../recruiter/entities/prospective-student.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([School, ProspectiveStudent]),
    UsersModule,
    RedisModule,
  ],
  controllers: [CollegeVerificationController],
  providers: [
    CollegeVerificationService,
    MailService,
    AuthRepository,
    RedisService,
  ],
})
export class CollegeVerificationModule {}
