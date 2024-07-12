import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import env from './shared/config/env';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { SharedModule } from './shared/shared.module';
import { ApiConfigService } from './shared/services/api-config.service';
import { RecruiterModule } from './recruiter/recruiter.module';
import { roles } from './app.roles';
import { AccessControlModule } from 'nest-access-control';
import { CollegeVerificationModule } from './college-verification/college-verification.module';
import { CreateAccountsModule } from './create-accounts/create-accounts.module';
import { FinancialAidOfficerModule } from './financial-aid-officer/financial-aid-officer.module';
import { StudentsModule } from './students/students.module';
import { AccessorModule } from './accessor/accessor.module';
import { BksdModule } from './bksd/bksd.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [env] }),
    TypeOrmModule.forRootAsync({
      imports: [SharedModule],
      useFactory: (configService: ApiConfigService) =>
        configService.TypeormConfig,
      inject: [ApiConfigService],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    SharedModule,
    UsersModule,
    AuthModule,
    RecruiterModule,
    CreateAccountsModule,
    CollegeVerificationModule,
    FinancialAidOfficerModule,
    StudentsModule,
    AdminModule,
    AccessControlModule.forRoles(roles),
    AccessorModule,
    BksdModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: 'APP_GUARD', useClass: ThrottlerGuard }],
})
export class AppModule {}
