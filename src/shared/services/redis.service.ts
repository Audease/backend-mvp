import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@Inject('REDIS') private readonly redis: Redis) {}

  getClient(): Redis {
    return this.redis;
  }
}
