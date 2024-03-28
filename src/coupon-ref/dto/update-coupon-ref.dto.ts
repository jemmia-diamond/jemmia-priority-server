import { PartialType } from '@nestjs/swagger';
import { CreateCouponRefDto } from './create-coupon-ref.dto';

export class UpdateCouponRefDto extends PartialType(CreateCouponRefDto) {}
