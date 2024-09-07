import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from '../users/entities/user.entity';
import { UserService } from '../users/users.service';
import { InductorDashboard } from './entity/inductor-dashboard.entity';
import { AccessorDashboard } from './entity/acessor-dashboard.entity';
import { BKSDDashboard } from './entity/bksd-dashboard.entity';
import { RecruiterDashboard } from './entity/recruiter-dashboard.entity';
import { DashboardRepository } from './dashboard.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Users,
      InductorDashboard,
      AccessorDashboard,
      BKSDDashboard,
      RecruiterDashboard,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService, DashboardRepository, UserService],
})
export class DashboardModule {}
