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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CouponDto, CouponSearchDto } from './dto/coupon.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { EUserRole } from '../user/enums/user-role.enum';
import { CouponServerDto } from './dto/coupon-server.dto';
import { Coupon } from './entities/coupon.entity';
import { Pagination } from 'nestjs-typeorm-paginate';

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

  @UseGuards(JwtAuthGuard)
  @Get('/coupon-server')
  async findAllCouponServer(
    @Request() req,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<Pagination<Coupon>> {
    limit = Math.min(50, limit); // Giới hạn limit tối đa là 50
    return this.couponService.findAllCouponServer(
      req.user.id,
      req.user.role,
      page,
      limit,
    );
  }

  @Get('/coupon-server/:id')
  async findOneCouponServer(@Request() req, @Param('id') id: string) {
    return this.couponService.findCouponServerById(
      req.user.id,
      req.user.role,
      id,
    );
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
