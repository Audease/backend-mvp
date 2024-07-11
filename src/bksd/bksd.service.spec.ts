import { Test, TestingModule } from '@nestjs/testing';
import { BksdService } from './bksd.service';

describe('BksdService', () => {
  let service: BksdService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BksdService],
    }).compile();

    service = module.get<BksdService>(BksdService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
