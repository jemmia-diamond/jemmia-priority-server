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
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { EUserRole } from '../user/enums/user-role.enum';
import { CouponRef } from './entities/coupon-ref.entity';
import { Pagination } from 'nestjs-typeorm-paginate';
import { InviteCouponRefDto } from './dto/invite-coupon-ref.dto';
import { RequestPayload } from '../types/controller.type';
import { ECouponRefType } from './enums/coupon-ref.enum';

@ApiTags('Coupon Referral')
@ApiBearerAuth()
@Controller('coupon-ref')
export class CouponRefController {
  constructor(private readonly couponRefService: CouponRefService) {}

  @UseGuards(JwtAuthGuard)
  @Roles(EUserRole.admin)
  @Post('/invite')
  async createInvite(@Body() payload: InviteCouponRefDto) {
    return this.couponRefService.createInvite(payload);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(EUserRole.admin)
  @Post()
  async create(@Body() createCouponRefDto: CreateCouponRefDto) {
    return this.couponRefService.create(createCouponRefDto);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(EUserRole.admin)
  @Get('/invite/:userId/convert-partner/:code')
  async convertPartnerToInvite(
    @Param('userId') userId: string,
    @Param('code') code: string,
  ) {
    return this.couponRefService.convertPartnerToInvite(userId, code);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/invite/:userId')
  @ApiQuery({
    name: 'used',
    type: Number,
    description: '',
    required: false,
  })
  async findAllInvite(
    @Request() req: RequestPayload,
    @Param('userId') userId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('type') type: ECouponRefType,
    @Query('used') used: string | null,
  ): Promise<Pagination<CouponRef>> {
    limit = Math.min(50, limit); // Giới hạn limit tối đa là 50
    return this.couponRefService.findAllInvite(
      req.user.role === EUserRole.admin ? userId : req.user.id,
      type,
      used ? Boolean(Number(used)) : null,
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
