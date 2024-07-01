import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProspectiveStudent } from './entities/prospective-student.entity';
import { Repository } from 'typeorm';
import { CreateLearnerDto } from './dto/create-learner.dto';
import { Recruiter } from './entities/recruiter.entity';
import { Users } from '../users/entities/user.entity';
import * as csvParse from 'csv-parse/lib/sync';
import { Readable } from 'stream';
import { parse } from 'csv-parse';

@Injectable()
export class RecruiterService {
  private readonly logger = new Logger(RecruiterService.name);

  constructor(
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    @InjectRepository(Recruiter)
    private readonly recruiterRepository: Repository<Recruiter>,
    @InjectRepository(ProspectiveStudent)
    private readonly learnerRepository: Repository<ProspectiveStudent>
  ) {}

  async createLearner(userId: string, createLearnerDto: CreateLearnerDto) {
    const loggedInUser = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!loggedInUser) {
      this.logger.error('User not found');
      throw new NotFoundException('User not found');
    }

    const recruiter = await this.recruiterRepository.findOne({
      where: { user: { id: userId } },
      relations: ['school'],
    });

    if (!recruiter) {
      this.logger.error('Recruiter not found for the user');
      throw new NotFoundException('Recruiter not found for the user');
    }

    const learnerExist = await this.learnerRepository.findOne({
      where: [
        { email: createLearnerDto.email },
        { mobile_number: createLearnerDto.mobile_number },
      ],
      relations: ['school', 'recruiter'],
    });

    if (learnerExist) {
      if (
        learnerExist.email === createLearnerDto.email ||
        learnerExist.mobile_number === createLearnerDto.mobile_number
      ) {
        this.logger.error('Email or mobile number already exist');
        throw new ConflictException('Email or mobile number already exist');
      }
    }

    const formatDate = (dateStr: string): string => {
      const date = new Date(dateStr);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const formattedDate = formatDate(createLearnerDto.date_of_birth);

    const learner = this.learnerRepository.create({
      name: createLearnerDto.name,
      date_of_birth: formattedDate,
      mobile_number: createLearnerDto.mobile_number,
      email: createLearnerDto.email,
      passport_number: createLearnerDto.passport_number,
      home_address: createLearnerDto.home_address,
      funding: createLearnerDto.funding,
      level: createLearnerDto.level,
      awarding: createLearnerDto.awarding,
      chosen_course: createLearnerDto.chosen_course,
      recruiter: recruiter,
      school: recruiter.school,
    });

    const newLearner = await this.learnerRepository.save(learner);
    this.logger.log('Learner created successfully');
    return { message: 'You just created a learner', newLearner };
  }

  async createLearnersFromCSV(userId: string, file: Express.Multer.File) {
    const loggedInUser = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!loggedInUser) {
      this.logger.error('User not found');
      throw new NotFoundException('User not found');
    }

    const recruiter = await this.recruiterRepository.findOne({
      where: { user: { id: userId } },
      relations: ['school'],
    });

    if (!recruiter) {
      this.logger.error('Recruiter not found for the user');
      throw new NotFoundException('Recruiter not found for the user');
    }

    const learners = [];
    const parser = parse(file.buffer.toString(), {
      columns: true,
      skip_empty_lines: true,
    });

    for await (const record of parser) {
      const learnerExist = await this.learnerRepository.findOne({
        where: [
          { email: record.email },
          { mobile_number: record.mobile_number },
        ],
        relations: ['school', 'recruiter'],
      });

      if (learnerExist) {
        this.logger.warn(
          `Email or mobile number already exist: ${record.email}, ${record.mobile_number}`
        );
        continue;
      }

      const formatDate = (dateStr: string): string => {
        const date = new Date(dateStr);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const formattedDate = formatDate(record.date_of_birth);

      const learner = this.learnerRepository.create({
        name: record.name,
        date_of_birth: formattedDate,
        mobile_number: record.mobile_number,
        email: record.email,
        passport_number: record.passport_number,
        home_address: record.home_address,
        funding: record.funding,
        level: record.level,
        awarding: record.awarding,
        chosen_course: record.chosen_course,
        recruiter: recruiter,
        school: recruiter.school,
      });

      learners.push(learner);
    }

    const newLearners = await this.learnerRepository.save(learners);
    this.logger.log('Learners created successfully from CSV');
    return { message: 'You just created learners from CSV', newLearners };
  }
}
