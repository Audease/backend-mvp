import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from './entities/user.entity';
import { UserService } from './users.service';
import { Roles } from '../shared/entities/role.entity';
import { School } from '../shared/entities/school.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Users, Roles, School])],
  providers: [UserService],
  exports: [UserService],
})
export class UsersModule {}
