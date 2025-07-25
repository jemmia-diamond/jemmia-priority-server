import { Module, forwardRef } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CustomerRankService } from './customer-rank.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Order } from '../order/entities/order.entity';
import { CustomerRankController } from './customer-rank.controller';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([User, Order]),
    forwardRef(() => UserModule),
  ],
  controllers: [CustomerRankController],
  providers: [CustomerRankService],
  exports: [CustomerRankService],
})
export class CustomerRankModule {}
