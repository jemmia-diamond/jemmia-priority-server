import { Module } from '@nestjs/common';
import { CouponRefService } from './coupon-ref.service';
import { CouponRefController } from './coupon-ref.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { CouponRef } from './entities/coupon-ref.entity';
import { CouponModule } from '../coupon/coupon.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, CouponRef]), CouponModule],
  controllers: [CouponRefController],
  providers: [CouponRefService],
})
export class CouponRefModule {}
