import { Module } from '@nestjs/common';
import { FinancialAidOfficerService } from './financial-aid-officer.service';
import { FinancialAidOfficerController } from './financial-aid-officer.controller';

@Module({
  controllers: [FinancialAidOfficerController],
  providers: [FinancialAidOfficerService],
})
export class FinancialAidOfficerModule {}
