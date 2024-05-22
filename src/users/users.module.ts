import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from './entities/user.entity';
import { UserService } from './users.service';
import { Roles } from '../shared/entities/role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Users, Roles])],
  providers: [UserService],
  exports: [UserService],
})
export class UsersModule {}
