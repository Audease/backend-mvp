import { Repository } from 'typeorm';
import { AppLogger } from '../entities/logger.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Users } from '../../users/entities/user.entity';
import { LogType } from '../../utils/enum/log_type';
import { InternalServerErrorException } from '@nestjs/common';
import { Logger as logs } from '@nestjs/common';

@Injectable()
export class LogService {
  private readonly logs = new logs(LogService.name);
  constructor(
    @InjectRepository(AppLogger)
    private logRepository: Repository<AppLogger>,
    @InjectRepository(Users)
    private userRepository: Repository<Users>
  ) {}

  async createLog(data: {
    userId: string;
    message: string;
    type: string;
    method: string;
    route: string;
    logType: LogType;
  }): Promise<AppLogger> {
    try {
      const log = this.logRepository.create({
        userId: data.userId,
        message: data.message,
        type: data.type,
        method: data.method,
        route: data.route,
        logType: data.logType,
        createdAt: new Date(),
      });

      return await this.logRepository.save(log);
    } catch (error) {
      console.log(error);
      this.logs.error('Failed to create log entry');
      throw new InternalServerErrorException(
        'Failed to create log entry',
        error.stack
      );
    }
  }

  async getPaginatedLogs(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const queryBuilder = this.logRepository
      .createQueryBuilder('log')
      .where('log.userId = :userId', { userId })
      .orderBy('log.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    const [logs, total] = await queryBuilder.getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      data: logs,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }
}
