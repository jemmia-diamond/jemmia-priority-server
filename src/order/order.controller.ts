import {
  Controller,
  Get,
  Param,
  UseGuards,
  Query,
  Request,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { HaravanOrderSearchDto } from '../haravan/dto/haravan-order.dto';
import { RequestPayload } from '../types/controller.type';

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
}
