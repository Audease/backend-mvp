import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { ProspectiveStudent } from './entities/prospective-student.entity';
import { Recruiter } from './entities/recruiter.entity';

@Injectable()
export class RecruiterRepository {
  constructor(
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    @InjectRepository(Recruiter)
    private readonly recruiterRepository: Repository<Recruiter>,
    @InjectRepository(ProspectiveStudent)
    private readonly learnerRepository: Repository<ProspectiveStudent>
  ) {}

  async findUser(userId: string) {
    return await this.userRepository.findOne({
      where: { id: userId },
      relations: ['school'],
    });
  }

  async findRecruiter(userId: string) {
    return await this.recruiterRepository.findOne({
      where: { user: { id: userId } },
      relations: ['school'],
    });
  }

  async findLearner(dto) {
    return await this.learnerRepository.findOne({
      where: [{ email: dto.email }, { mobile_number: dto.mobile_number }],
      relations: ['school', 'user'],
    });
  }

  async findStudent(learnerId: string) {
    return await this.learnerRepository.findOne({
      where: { id: learnerId },
    });
  }
}
