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
import { RoleGuard } from './auth/role.guard';
import { CreateAccountsModule } from './create-accounts/create-accounts.module';
import { FinancialAidOfficerModule } from './financial-aid-officer/financial-aid-officer.module';
import { StudentsModule } from './students/students.module';

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
    FinancialAidOfficerModule,
    StudentsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: 'APP_GUARD', useClass: ThrottlerGuard },
    { provide: 'APP_GUARD', useClass: RoleGuard },
  ],
})
export class AppModule {}
