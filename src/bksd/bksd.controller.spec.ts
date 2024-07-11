import { Test, TestingModule } from '@nestjs/testing';
import { BksdController } from './bksd.controller';
import { BksdService } from './bksd.service';

describe('BksdController', () => {
  let controller: BksdController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BksdController],
      providers: [BksdService],
    }).compile();

    controller = module.get<BksdController>(BksdController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
