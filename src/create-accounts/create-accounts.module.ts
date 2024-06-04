import { Logger, Module } from '@nestjs/common';
import { CreateAccountsService } from './create-accounts.service';
import { CreateAccountsController } from './create-accounts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { School } from 'src/shared/entities/school.entity';
import { Recruiter } from 'src/recruiter/entities/recruiter.entity';
import { UsersModule } from 'src/users/users.module';
import { AccountRepository } from './account.repository';
import { UserService } from 'src/users/users.service';
import { Users } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([School, Recruiter, Users]), UsersModule],
  controllers: [CreateAccountsController],
  providers: [CreateAccountsService, AccountRepository, UserService, Logger],
})
export class CreateAccountsModule {}
