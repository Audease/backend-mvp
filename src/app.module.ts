import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import env from './shared/config/env';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { SharedModule } from './shared/shared.module';
import { ApiConfigService } from './shared/services/api-config.service';

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
  ],
  controllers: [AppController],
  providers: [AppService, { provide: 'APP_GUARD', useClass: ThrottlerGuard }],
})
export class AppModule {}
