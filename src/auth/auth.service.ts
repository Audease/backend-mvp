import { AuthRepository } from './auth.repository';
import { JwtAuthService } from './jwt.service';
import { Redis } from 'ioredis';
import { UserService } from '../users/users.service';
import { Injectable } from '@nestjs/common';
import { CreateSchoolDto } from './dto/create-school.dto';
import { ISchoolCreate } from './auth.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtAuthService,
    private readonly userService: UserService,
    private readonly redis: Redis,
  ) {}

  async createSchool(
    createSchoolDto: CreateSchoolDto,
  ): Promise<ISchoolCreate> {
    return {
        message: 'School created successfully',
    }
  }
}
