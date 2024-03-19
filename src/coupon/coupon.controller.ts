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
  Request,
} from '@nestjs/common';
import { CouponService } from './coupon.service';
import { ApiTags } from '@nestjs/swagger';
import { CouponDto, CouponSearchDto } from './dto/coupon.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { EUserRole } from '../user/enums/user-role.enum';
import { GiftDto } from './dto/gift.dto';
import { Coupon } from './entities/gift.entity';
import { Pagination } from 'nestjs-typeorm-paginate';

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

  @UseGuards(JwtAuthGuard)
  @Roles(EUserRole.admin)
  @Post('/gift')
  createGift(@Body() data: GiftDto) {
    return this.couponService.createGift(data);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/gift/:id')
  receiveGift(@Request() req, @Param('id') id: string) {
    return this.couponService.receiveGift(req.user.id, id);
  }

  @Get()
  findAll(@Query() query: CouponSearchDto) {
    return this.couponService.findAllCoupon(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/gift')
  async findAllGift(
    @Request() req,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<Pagination<Coupon>> {
    limit = Math.min(50, limit); // Giới hạn limit tối đa là 50
    return this.couponService.findAllGift(
      req.user.id,
      req.user.role,
      page,
      limit,
    );
  }

  @Get('/gift/:id')
  async findOneGift(@Request() req, @Param('id') id: string) {
    return this.couponService.findGiftById(req.user.id, req.user.role, id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.couponService.findCoupon(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(EUserRole.admin)
  @Put(':id/status/enable')
  updateGift(@Param('id') id: string, @Body() data: GiftDto) {
    return this.couponService.updateGift(id, data);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(EUserRole.admin)
  @Put(':id/gift')
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
  @Delete(':id/gift')
  removeGift(@Param('id') id: string) {
    return this.couponService.deleteGift(id);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(EUserRole.admin)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.couponService.deleteCoupon(+id);
  }
}
