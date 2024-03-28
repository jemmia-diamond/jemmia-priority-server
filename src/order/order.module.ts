import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HaravanModule } from '../haravan/haravan.module';
import { User } from '../user/entities/user.entity';
import { CouponRefModule } from '../coupon-ref/coupon-ref.module';
import { UserService } from '../user/user.service';
import { Order } from './entities/order.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Order]),
    HaravanModule,
    CouponRefModule,
  ],
  controllers: [OrderController],
  providers: [OrderService, UserService],
})
export class OrderModule {}
