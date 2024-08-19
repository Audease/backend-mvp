import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { JwtAuthService } from './jwt.service';
import { MailService } from '../shared/services/mail.service';
import { UserService } from '../users/users.service';
import { Logger } from '@nestjs/common';
import { RedisModule } from '../shared/module/redis.module';
import { RedisService } from '../shared/services/redis.service';
import { School } from '../shared/entities/school.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from '../shared/entities/token.entity';
import { JwtService } from '@nestjs/jwt';
import { Users } from '../users/entities/user.entity';
import { Roles } from '../shared/entities/role.entity';
import { Recruiter } from '../recruiter/entities/recruiter.entity';
import { Repository } from 'typeorm';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { Permissions } from '../shared/entities/permission.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      School,
      Token,
      Users,
      Roles,
      Recruiter,
      Permissions,
    ]),
    RedisModule,
    UsersModule,
    JwtModule.register({
      secret: process.env.ACCESS_TOKEN_SECRET,
      signOptions: {
        expiresIn: '15m',
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtService,
    AuthRepository,
    JwtAuthService,
    MailService,
    UserService,
    RedisService,
    Logger,
    Repository,
    JwtStrategy,
  ],
})
export class AuthModule {}
