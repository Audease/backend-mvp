import { Test, TestingModule } from '@nestjs/testing';
import { InductorService } from './inductor.service';

describe('InductorService', () => {
  let service: InductorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InductorService],
    }).compile();

    service = module.get<InductorService>(InductorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
