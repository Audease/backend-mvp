import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TransactionRunner } from './TransactionManager.service';

@Injectable()
export class DbTransactionFactory {
  constructor(private readonly dataSource: DataSource) {}

  async createTransaction(): Promise<TransactionRunner> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    return new TransactionRunner(queryRunner);
  }
}
