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
import { InviteCouponRefDto } from './dto/invite-coupon-ref.dto';
import { RequestPayload } from '../types/controller.type';

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
  @Get('/invite/partner')
  async findAllInvitePartner(
    @Request() req: RequestPayload,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<Pagination<CouponRef>> {
    limit = Math.min(50, limit); // Giới hạn limit tối đa là 50
    return this.couponRefService.findAllInvitePartner(
      req.user.id,
      req.user.role,
      page,
      limit,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('/invite/:userId')
  async findInvite(
    @Request() req: RequestPayload,
    @Param('userId') userId: string,
  ) {
    return this.couponRefService.findInvite(
      req.user.role != EUserRole.admin ? req.user.id : userId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Roles(EUserRole.admin)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.couponRefService.remove(id);
  }
}
