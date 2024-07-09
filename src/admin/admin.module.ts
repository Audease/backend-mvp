import { Student } from '../students/entities/student.entity';
import { School } from '../shared/entities/school.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Logger, Module } from '@nestjs/common';
import { AuthRepository } from '../auth/auth.repository';
import { AdminRepository } from './admin.repository';

@Module({
  imports: [TypeOrmModule.forFeature([School, Student])],
  controllers: [],
  providers: [AuthRepository, AdminRepository, Logger],
})
export class AdminModule {}
