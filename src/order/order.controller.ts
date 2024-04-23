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
  UnauthorizedException,
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
    @Body() body: HaravanOrderDto,
    @Headers() headers: any,
  ) {
    // if (
    //   this.orderService.verifyHaravanHook(
    //     body,
    //     headers['x-haravan-hmacsha256'],
    //   ) &&
    //   headers['x-haravan-hmacsha256']
    // ) {
    //   console.log('/hook/haravan/create');
    //   console.log(JSON.stringify(body));
    //   console.log('========== HANDLE HOOK ===========');

    //   const res = await this.orderService.haravanHook(body);
    //   return res;
    // } else {
    //   await this.telegramBotService.sendException(
    //     'ORRDER HOOK VERIFY FAILED',
    //     '',
    //     JSON.stringify(headers),
    //     body,
    //   );
    //   throw new UnauthorizedException();
    // }

    await axios.post(
      `https://api.bizfly.vn/webhook/web_hook_haravan?token_crm=c1pGa0FISC96VDd1N3FZR21KakI0bnljRE0zbTB5eDljM01ocW5JWDRBYnNqc215Yi9wMTdhSkd4WXp2Z0R2Sk9qRzZuYUFFOGJPSTFtS09WMnhTb1E9PQ==&project_id=65796b5ad887266a17635b6d`,
      body,
    );

    return this.orderService.haravanHook(body);
  }

  @Post('/hook')
  async hook(@Body() body: any) {
    console.log(body);

    return;
  }
}
