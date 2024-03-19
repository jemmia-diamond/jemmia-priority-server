import { Module } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CouponController } from './coupon.controller';
import { HaravanModule } from '../haravan/haravan.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Coupon } from './entities/gift.entity';
import { CouponUser } from './entities/gift-user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Coupon, CouponUser]),
    HaravanModule,
  ],
  controllers: [CouponController],
  providers: [CouponService],
})
export class CouponModule {}
