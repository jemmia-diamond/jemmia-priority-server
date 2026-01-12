import {
  Controller,
  Get,
  Param,
  UseGuards,
  Query,
  Request,
  Post,
  Body,
  Headers,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { HaravanOrderDto } from '../haravan/dto/haravan-order.dto';
import { RequestPayload } from '../shared/types/controller.type';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CouponRefService } from '../coupon-ref/coupon-ref.service';
import { UserService } from '../user/user.service';
import { OrderQueryDto } from './dto/order-query.dto';
import { EUserRole } from '../user/enums/user-role.enum';
import { TelegramBotService } from '../helpers/telegram-bot.service';
import axios from 'axios';

@ApiTags('Order')
@ApiBearerAuth()
@Controller('order')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly couponRefService: CouponRefService,
    private readonly userService: UserService,
    private readonly telegramBotService: TelegramBotService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Request() req: RequestPayload, @Query() query: OrderQueryDto) {
    if (req.user.role != EUserRole.admin) {
      query.userId = req.user.id;
    }
    query.limit = Math.min(50, query.limit);

    return this.orderService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Request() req: RequestPayload, @Param('id') id: number) {
    return this.orderService.findOne(+id, req.user.role, req.user.id);
  }

  @Post('/haravan/hook')
  async haravanHookCreate(
    @Request() req: RequestPayload,
    @Body() body: any,
    @Headers() headers: any,
  ) {
    console.log(JSON.stringify(headers));
    console.log(JSON.stringify(body));

    const orderData = body.order || body;
    await this.orderService.haravanHook(orderData);

    return;
  }

  @Post('/hook')
  async hook(@Body() body: any) {
    console.log(body);

    return;
  }
}
