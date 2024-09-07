import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from '../users/entities/user.entity';
import { UsersModule } from '../users/users.module';
import { InductorDashboard } from './entity/inductor-dashboard.entity';
import { AccessorDashboard } from './entity/acessor-dashboard.entity';
import { BKSDDashboard } from './entity/bksd-dashboard.entity';
import { RecruiterDashboard } from './entity/recruiter-dashboard.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Users,
      InductorDashboard,
      AccessorDashboard,
      BKSDDashboard,
      RecruiterDashboard,
    ]),
    UsersModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
