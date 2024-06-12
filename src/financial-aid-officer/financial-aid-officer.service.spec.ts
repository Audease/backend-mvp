import { Test, TestingModule } from '@nestjs/testing';
import { FinancialAidOfficerService } from './financial-aid-officer.service';

describe('FinancialAidOfficerService', () => {
  let service: FinancialAidOfficerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FinancialAidOfficerService],
    }).compile();

    service = module.get<FinancialAidOfficerService>(
      FinancialAidOfficerService
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
