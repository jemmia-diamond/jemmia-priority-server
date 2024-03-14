import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CouponService } from './coupon.service';
import { ApiTags } from '@nestjs/swagger';
import { CouponDto, CouponSearchDto } from './dto/coupon.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { EUserRole } from '../user/enums/user-role.enum';

@ApiTags('Coupon')
@Controller('coupon')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @UseGuards(JwtAuthGuard)
  @Roles(EUserRole.admin)
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

  @UseGuards(JwtAuthGuard)
  @Roles(EUserRole.admin)
  @Put(':id/status/enable')
  enableStatus(@Param('id') id: string) {
    return this.couponService.toggleStatus(+id, true);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(EUserRole.admin)
  @Put(':id/status/disable')
  disableStatus(@Param('id') id: string) {
    return this.couponService.toggleStatus(+id, false);
  }

  // @Put(':id')
  // update(@Param('id') id: string, @Body() data: CouponDto) {
  //   return this.couponService.updateCoupon(+id, data);
  // }

  @UseGuards(JwtAuthGuard)
  @Roles(EUserRole.admin)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.couponService.deleteCoupon(+id);
  }
}
