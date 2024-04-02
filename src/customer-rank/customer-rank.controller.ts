import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequestPayload } from '../shared/types/controller.type';
import { CustomerRankService } from './customer-rank.service';

@ApiTags('Customer Rank')
@ApiBearerAuth()
@Controller('customer-rank')
export class CustomerRankController {
  constructor(private readonly customerRankService: CustomerRankService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/rank-info')
  async getRankInfo(@Request() req: RequestPayload) {
    return this.customerRankService.getRankInfo(req.user.id);
  }
}
