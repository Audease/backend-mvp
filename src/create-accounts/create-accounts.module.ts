import { Logger, Module } from '@nestjs/common';
import { CreateAccountsService } from './create-accounts.service';
import { CreateAccountsController } from './create-accounts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { School } from '../shared/entities/school.entity';
import { Recruiter } from '../recruiter/entities/recruiter.entity';
import { UsersModule } from '../users/users.module';
import { Repository } from 'typeorm';
import { AccountRepository } from './account.repository';
import { UserService } from '../users/users.service';
import { Roles } from '../shared/entities/role.entity';
import { Users } from '../users/entities/user.entity';
import { MailService } from '../shared/services/mail.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([School, Recruiter, Roles, Users]),
    UsersModule,
  ],
  controllers: [CreateAccountsController],
  providers: [
    CreateAccountsService,
    Repository,
    AccountRepository,
    UserService,
    Logger,
    MailService
  ],
})
export class CreateAccountsModule {}
