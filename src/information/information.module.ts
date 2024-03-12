import { Module } from '@nestjs/common';
import { InformationService } from './information.service';
import { InformationController } from './information.controller';
import { HaravanModule } from '../haravan/haravan.module';
@Module({
  imports: [HaravanModule],
  controllers: [InformationController],
  providers: [InformationService],
  exports: [],
})
export class InformationModule {}
