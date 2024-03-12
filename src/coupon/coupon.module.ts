import { Module } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CouponController } from './coupon.controller';
import { HaravanModule } from '../haravan/haravan.module';

@Module({
  imports: [HaravanModule],
  controllers: [CouponController],
  providers: [CouponService],
})
export class CouponModule {}
