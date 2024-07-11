import { Test, TestingModule } from '@nestjs/testing';
import { AccessorService } from './accessor.service';

describe('AccessorService', () => {
  let service: AccessorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccessorService],
    }).compile();

    service = module.get<AccessorService>(AccessorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
