import { Test, TestingModule } from '@nestjs/testing';
import { CreateAccountsController } from './create-accounts.controller';
import { CreateAccountsService } from './create-accounts.service';

describe('CreateAccountsController', () => {
  let controller: CreateAccountsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CreateAccountsController],
      providers: [CreateAccountsService],
    }).compile();

    controller = module.get<CreateAccountsController>(CreateAccountsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
