import { Module } from '@nestjs/common';
import { CouponRefService } from './coupon-ref.service';
import { CouponRefController } from './coupon-ref.controller';

@Module({
  controllers: [CouponRefController],
  providers: [CouponRefService],
})
export class CouponRefModule {}
