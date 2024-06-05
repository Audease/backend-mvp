import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { RedisService } from '../services/redis.service';

@Injectable()
export class TwoAuthGuard implements CanActivate {
    constructor(private readonly redisService: RedisService) {}

    get redis() {
        return this.redisService.getClient();
    }

    
}