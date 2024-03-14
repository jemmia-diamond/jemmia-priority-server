import { Injectable } from '@nestjs/common';
import { HaravanService } from '../haravan/haravan.service';
import { CouponDto, CouponSearchDto } from './dto/coupon.dto';

@Injectable()
export class CouponService {
  constructor(private haravanService: HaravanService) {}

  async createCoupon(data: CouponDto) {
    try {
      return await this.haravanService.createCoupon(data);
    } catch (e) {
      return e;
    }
  }

  async updateCoupon(couponId: number, data: CouponDto) {
    try {
      data.id = couponId;
      return await this.haravanService.updateCoupon(data);
    } catch (e) {
      return e;
    }
  }

  async toggleStatus(couponId: number, enable: boolean) {
    try {
      return this.haravanService.toggleStatus(couponId, enable);
    } catch (e) {
      return e;
    }
  }

  async deleteCoupon(couponId: number) {
    try {
      return this.haravanService.deleteCoupon(couponId);
    } catch (e) {
      return e;
    }
  }

  async findCoupon(couponId: number) {
    try {
      return this.haravanService.findCoupon(couponId);
    } catch (e) {
      return e;
    }
  }

  async findAllCoupon(query: CouponSearchDto) {
    try {
      return {
        coupons: await this.haravanService.findAllCoupon(query),
      };
    } catch (e) {
      return e;
    }
  }
}
