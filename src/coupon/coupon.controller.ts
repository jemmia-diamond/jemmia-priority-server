import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Put,
} from '@nestjs/common';
import { CouponService } from './coupon.service';
import { ApiTags } from '@nestjs/swagger';
import { CouponDto, CouponSearchDto } from './dto/coupon.dto';

@ApiTags('Coupon')
@Controller('coupon')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post()
  create(@Body() data: CouponDto) {
    return this.couponService.createCoupon(data);
  }

  @Get()
  findAll(@Query() query: CouponSearchDto) {
    return this.couponService.findAllCoupon(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.couponService.findCoupon(+id);
  }

  @Put(':id/status/enable')
  enableStatus(@Param('id') id: string) {
    return this.couponService.toggleStatus(+id, true);
  }

  @Put(':id/status/disable')
  disableStatus(@Param('id') id: string) {
    return this.couponService.toggleStatus(+id, false);
  }

  // @Put(':id')
  // update(@Param('id') id: string, @Body() data: CouponDto) {
  //   return this.couponService.updateCoupon(+id, data);
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.couponService.deleteCoupon(+id);
  }
}
