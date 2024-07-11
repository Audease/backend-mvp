import { Module } from '@nestjs/common';
import { BksdService } from './bksd.service';
import { BksdController } from './bksd.controller';

@Module({
  controllers: [BksdController],
  providers: [BksdService],
})
export class BksdModule {}
