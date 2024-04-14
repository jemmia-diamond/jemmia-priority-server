import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequestPayload } from '../shared/types/controller.type';
import { CustomerRankService } from './customer-rank.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { EUserRole } from '../user/enums/user-role.enum';

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

  @UseGuards(JwtAuthGuard)
  @Roles(EUserRole.admin)
  @Get('/report')
  async getReport(@Request() req: RequestPayload) {
    return this.customerRankService.getReport(req.user.id);
  }
}
