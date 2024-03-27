import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CronJobProvider } from './cron-job-ranking.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Order } from '../order/entities/order.entity';

@Module({
  imports: [ScheduleModule.forRoot(), TypeOrmModule.forFeature([User, Order])],
  providers: [CronJobProvider],
})
export class CronJobRankingModule {}
