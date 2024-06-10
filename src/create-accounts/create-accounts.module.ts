import { Logger, Module } from '@nestjs/common';
import { CreateAccountsService } from './create-accounts.service';
import { CreateAccountsController } from './create-accounts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { School } from '../shared/entities/school.entity';
import { Recruiter } from '../recruiter/entities/recruiter.entity';
import { UsersModule } from '../users/users.module';
import { Repository } from 'typeorm';
import { AccountRepository } from './account.repository';
import { UserService } from 'src/users/users.service';
import { Users } from 'src/users/entities/user.entity';
import { FinancialAidOfficer } from 'src/financial-aid-officer/entities/financial-aid-officer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([School, Recruiter, Users, FinancialAidOfficer]), UsersModule],
  controllers: [CreateAccountsController],
  providers: [CreateAccountsService, Repository, AccountRepository, Logger],

})
export class CreateAccountsModule {}
