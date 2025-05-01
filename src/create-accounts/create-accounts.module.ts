// import { Logger, Module } from '@nestjs/common';
// import { CreateAccountsService } from './create-accounts.service';
// import { CreateAccountsController } from './create-accounts.controller';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { School } from '../shared/entities/school.entity';
// import { Recruiter } from '../recruiter/entities/recruiter.entity';
// import { UsersModule } from '../users/users.module';
// import { Repository } from 'typeorm';
// import { AccountRepository } from './account.repository';
// import { Users } from '../users/entities/user.entity';
// import { FinancialAidOfficer } from '../financial-aid-officer/entities/financial-aid-officer.entity';
// import { MailService } from '../shared/services/mail.service';
// import { Student } from '../students/entities/student.entity';
// import { RedisModule } from '../shared/module/redis.module';
// import { Accessor } from '../accessor/entities/accessor.entity';

// @Module({
//   imports: [
//     TypeOrmModule.forFeature([
//       School,
//       Recruiter,
//       Users,
//       FinancialAidOfficer,
//       Student,
//       Accessor,
//     ]),
//     UsersModule,
//     RedisModule,
//   ],
//   controllers: [CreateAccountsController],
//   providers: [
//     CreateAccountsService,
//     Repository,
//     AccountRepository,
//     Logger,
//     MailService,
//   ],
//   exports: [CreateAccountsService],
// })
// export class CreateAccountsModule {}
