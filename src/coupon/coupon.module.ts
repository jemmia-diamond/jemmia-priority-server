import { Module } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CouponController } from './coupon.controller';
import { HaravanModule } from '../haravan/haravan.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Coupon } from './entities/coupon.entity';
import { CouponRedeemed } from './entities/coupon-user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Coupon, CouponRedeemed]),
    HaravanModule,
  ],
  controllers: [CouponController],
  providers: [CouponService],
  exports: [CouponService],
})
export class CouponModule {}
