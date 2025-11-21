import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SyncCrmService } from './sync-crm.service';
import { BearerAuthGuard } from '../auth/guards/bearer-auth.guard';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Sync CRM')
@Controller('sync-crm')
export class SyncCrmController {
  constructor(private readonly syncCrmService: SyncCrmService) {}

  @Get('/coupon-ref')
  @UseGuards(BearerAuthGuard)
  async syncCouponRef(
    @Query('updatedInCrm') updatedInCrm?: string,
    @Query('haravanId') haravanId?: string,
  ) {
    const updatedInCrmFilter =
      updatedInCrm === 'true'
        ? true
        : updatedInCrm === 'false'
          ? false
          : undefined;

    return this.syncCrmService.syncCouponRef({
      updatedInCrm: updatedInCrmFilter,
      haravanId,
    });
  }
}
