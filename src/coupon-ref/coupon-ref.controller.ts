import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { CouponRefService } from './coupon-ref.service';
import { CreateCouponRefDto } from './dto/create-coupon-ref.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { EUserRole } from '../user/enums/user-role.enum';
import { CouponRef } from './entities/coupon-ref.entity';
import { Pagination } from 'nestjs-typeorm-paginate';

@ApiTags('CouponRef')
@ApiBearerAuth()
@Controller('coupon-ref')
export class CouponRefController {
  constructor(private readonly couponRefService: CouponRefService) {}

  @UseGuards(JwtAuthGuard)
  @Roles(EUserRole.admin)
  @Post()
  async create(@Body() createCouponRefDto: CreateCouponRefDto) {
    return this.couponRefService.create(createCouponRefDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/gift')
  async findAllGift(
    @Request() req,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<Pagination<CouponRef>> {
    limit = Math.min(50, limit); // Giới hạn limit tối đa là 50
    return this.couponRefService.findAll(
      req.user.id,
      req.user.role,
      page,
      limit,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Roles(EUserRole.admin)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.couponRefService.remove(id);
  }
}
