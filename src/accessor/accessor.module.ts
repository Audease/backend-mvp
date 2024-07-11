import { Module } from '@nestjs/common';
import { AccessorService } from './accessor.service';
import { AccessorController } from './accessor.controller';

@Module({
  controllers: [AccessorController],
  providers: [AccessorService],
})
export class AccessorModule {}
