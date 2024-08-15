import { Module } from '@nestjs/common';
import { RedisService } from '../services/redis.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Module({
  imports: [ConfigModule],
  providers: [
    RedisService,
    {
      provide: 'REDIS',
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL');
        return new Redis(redisUrl);
      },
      inject: [ConfigService],
    },
  ],
  exports: [RedisService, 'REDIS'],
})
export class RedisModule {}
