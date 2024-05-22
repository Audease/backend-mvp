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

  async createSchool(createSchoolDto: CreateSchoolDto): Promise<ISchoolCreate> {
    const {
      first_name,
      last_name,
      email,
      address_line1,
      address_line2,
      business_code,
      city,
      college_name,
      country,
      no_of_employee,
      post_code,
      state,
    } = createSchoolDto;

    const data = await this.authRepository.create({
      college_name,
      state,
      address_line1,
      address_line2,
      business_code,
      city,
      country,
      no_of_employee,
      post_code,
    });

    await this.redis.set(
      email,
      JSON.stringify({ first_name, last_name, email, college_id: data.id }),
    );

    return {
      message:
        'School created successfully check your mail for further instructions',
    };
  }
}
