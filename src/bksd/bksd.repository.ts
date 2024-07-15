import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from '../users/entities/user.entity';

import { Repository } from 'typeorm';
import { Accessor } from '../accessor/entities/accessor.entity';
import { ProspectiveStudent } from '../recruiter/entities/prospective-student.entity';

@Injectable()
export class BksdRepository {
  constructor(
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    @InjectRepository(Accessor)
    private readonly accessorRepository: Repository<Accessor>,
    @InjectRepository(ProspectiveStudent)
    private readonly learnerRepository: Repository<ProspectiveStudent>
  ) {}

  async findUser(userId: string) {
    return await this.userRepository.findOne({
      where: { id: userId },
      relations: ['school'],
    });
  }

  async findAccessor(userId: string) {
    return await this.accessorRepository.findOne({
      where: { user: { id: userId } },
      relations: ['school'],
    });
  }

  async findLearner(applicantId: string, accessor) {
    return await this.learnerRepository.findOne({
      where: { id: applicantId, school: { id: accessor.school.id } },
      relations: ['school', 'recruiter'],
    });
  }
}
