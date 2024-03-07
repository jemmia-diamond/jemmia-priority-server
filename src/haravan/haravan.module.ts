import { Module } from '@nestjs/common';
import { HaravanService } from './haravan.service';

@Module({
  controllers: [],
  providers: [HaravanService],
  exports: [HaravanService],
})
export class HaravanModule {}
