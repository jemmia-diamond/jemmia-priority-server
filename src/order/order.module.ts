import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HaravanModule } from '../haravan/haravan.module';
import { User } from '../user/entities/user.entity';
import { CouponRefModule } from '../coupon-ref/coupon-ref.module';
import { Order } from './entities/order.entity';
import { UserModule } from '../user/user.module';
import { CouponRef } from '../coupon-ref/entities/coupon-ref.entity';
import { CustomerRankModule } from '../customer-rank/customer-rank.module';
import { Notification } from '../notification/entities/notification.entity';
import { CrmModule } from '../crm/crm.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Order, CouponRef, Notification]),
    HaravanModule,
    CouponRefModule,
    UserModule,
    CustomerRankModule,
    CrmModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
