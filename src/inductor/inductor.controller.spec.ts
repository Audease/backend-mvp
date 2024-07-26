import { Test, TestingModule } from '@nestjs/testing';
import { InductorController } from './inductor.controller';
import { InductorService } from './inductor.service';

describe('InductorController', () => {
  let controller: InductorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InductorController],
      providers: [InductorService],
    }).compile();

    controller = module.get<InductorController>(InductorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
