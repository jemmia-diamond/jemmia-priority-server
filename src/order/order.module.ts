import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HaravanModule } from '../haravan/haravan.module';
import { User } from '../user/entities/user.entity';
import { CouponRefModule } from '../coupon-ref/coupon-ref.module';
import { Order } from './entities/order.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Order]),
    HaravanModule,
    CouponRefModule,
    UserModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
