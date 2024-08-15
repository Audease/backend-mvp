import { Test, TestingModule } from '@nestjs/testing';
import { FinancialAidOfficerController } from './financial-aid-officer.controller';
import { FinancialAidOfficerService } from './financial-aid-officer.service';

describe('FinancialAidOfficerController', () => {
  let controller: FinancialAidOfficerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FinancialAidOfficerController],
      providers: [FinancialAidOfficerService],
    }).compile();

    controller = module.get<FinancialAidOfficerController>(
      FinancialAidOfficerController
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
