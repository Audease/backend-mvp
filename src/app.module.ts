import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { dataSource } from './database/ormconfig';
import env from './shared/config/env';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true, load: [env]})
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
