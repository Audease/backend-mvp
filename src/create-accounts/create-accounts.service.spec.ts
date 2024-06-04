import { Test, TestingModule } from '@nestjs/testing';
import { CreateAccountsService } from './create-accounts.service';

describe('CreateAccountsService', () => {
  let service: CreateAccountsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CreateAccountsService],
    }).compile();

    service = module.get<CreateAccountsService>(CreateAccountsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
