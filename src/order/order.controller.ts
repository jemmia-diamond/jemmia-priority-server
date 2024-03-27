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

@ApiTags('Order')
@ApiBearerAuth()
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

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

  @Post('/hook/haravan')
  haravanHookCreate(
    @Request() req: RequestPayload,
    @Body() body: HaravanOrderDto,
  ) {
    const customer = body.customer;

    if (customer.id == null) {
      // return user, make them register first!
      return null;
    }

    // the first time user have made an order.
    if (customer.ordersCount === 1) {
    } else {
    }

    return this.orderService.haravanHook(body);
  }

  @Put('/hook/haravan')
  haravanHookUpdate(
    @Request() req: RequestPayload,
    @Body() body: HaravanOrderDto,
  ) {
    console.log('hook update');
    return this.orderService.haravanHook(body);
  }
}
