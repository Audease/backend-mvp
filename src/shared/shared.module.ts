import { Global, Module } from '@nestjs/common';
import { ApiConfigService } from './services/api-config.service';
// import { RedisModule } from './module/redis.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { DbTransactionFactory } from './services/transactions/TransactionManager';
import { TransactionRunner } from './services/transactions/TransactionManager.service';
import { UsernameGeneratorService } from './services/username-generator.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([])],
  providers: [
    ApiConfigService,
    ConfigService,
    DbTransactionFactory,
    TransactionRunner,
    UsernameGeneratorService,
  ],
  exports: [
    ApiConfigService,
    ConfigService,
    DbTransactionFactory,
    TransactionRunner,
    UsernameGeneratorService,
  ],
})
export class SharedModule {}
