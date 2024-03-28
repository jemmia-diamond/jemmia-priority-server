import {
  Controller,
  Get,
  Param,
  UseGuards,
  Query,
  Request,
  Post,
  Body,
  Put,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  HaravanOrderDto,
  HaravanOrderSearchDto,
} from '../haravan/dto/haravan-order.dto';
import { RequestPayload } from '../types/controller.type';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CouponRefService } from '../coupon-ref/coupon-ref.service';
import { UserService } from '../user/user.service';

@ApiTags('Order')
@ApiBearerAuth()
@Controller('order')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly couponRefService: CouponRefService,
    private readonly userService: UserService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(
    @Request() req: RequestPayload,
    @Query() query: HaravanOrderSearchDto,
  ) {
    return this.orderService.findAll(query, req.user.role, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Request() req: RequestPayload, @Param('id') id: number) {
    return this.orderService.findOne(+id, req.user.role, req.user.id);
  }

  @Post('/hook/haravan/create')
  async haravanHookCreate(
    @Request() req: RequestPayload,
    @Body() body: HaravanOrderDto,
  ) {
    console.log('/hook/haravan/create');
    console.log(JSON.stringify(body));
    console.log('========== HANDLE HOOK ===========');
    // Xử lý xác thực token từ webhook.
    const res = await this.orderService.haravanHook(body);
    return res;
  }

  @Put('/hook/haravan')
  haravanHookUpdate(
    @Request() req: RequestPayload,
    @Body() body: HaravanOrderDto,
  ) {
    console.log('/hook/haravan');
    console.log(body);
    return this.orderService.haravanHook(body);
  }
}
