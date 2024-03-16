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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CouponDto, CouponSearchDto } from './dto/coupon.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { EUserRole } from '../user/enums/user-role.enum';
import { CouponServerDto } from './dto/coupon-server.dto';

@ApiTags('Coupon')
@ApiBearerAuth()
@Controller('coupon')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @UseGuards(JwtAuthGuard)
  @Roles(EUserRole.admin)
  @Post()
  create(@Body() data: CouponDto) {
    return this.couponService.createCoupon(data);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(EUserRole.admin)
  @Post('/coupon-server')
  createCouponServer(@Body() data: CouponServerDto) {
    return this.couponService.createCouponServer(data);
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
  updateCouponServer(@Param('id') id: string, @Body() data: CouponServerDto) {
    return this.couponService.updateCouponServer(id, data);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(EUserRole.admin)
  @Put(':id/coupon-server')
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
  @Delete(':id/coupon-server')
  removeCouponServer(@Param('id') id: string) {
    return this.couponService.deleteCouponServer(id);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(EUserRole.admin)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.couponService.deleteCoupon(+id);
  }
}
