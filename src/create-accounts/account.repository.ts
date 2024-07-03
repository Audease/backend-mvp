import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from '../users/entities/user.entity';

import { Repository } from 'typeorm';

@Injectable()
export class AccountRepository {
  constructor(
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>
  ) {}

  async findAdmin(userId: string) {
    return await this.userRepository.findOne({
      where: { id: userId },
      relations: ['school'],
    });
  }
}
