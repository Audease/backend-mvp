import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from './entities/user.entity';
import { UserService } from './users.service';
import { Roles } from '../shared/entities/role.entity';
import { Repository } from 'typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Users, Roles])],
  providers: [UserService, Repository],
  exports: [UserService],
})
export class UsersModule {}
