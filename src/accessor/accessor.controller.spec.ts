import { Test, TestingModule } from '@nestjs/testing';
import { AccessorController } from './accessor.controller';
import { AccessorService } from './accessor.service';

describe('AccessorController', () => {
  let controller: AccessorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccessorController],
      providers: [AccessorService],
    }).compile();

    controller = module.get<AccessorController>(AccessorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
