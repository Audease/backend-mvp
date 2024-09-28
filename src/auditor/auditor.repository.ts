import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from '../users/entities/user.entity';

import { Repository } from 'typeorm';

@Injectable()
export class AuditorRepository {
  constructor(
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>
  ) {}

  async findUser(userId: string) {
    return await this.userRepository.findOne({
      where: { id: userId },
      relations: ['school'],
    });
  }
}
