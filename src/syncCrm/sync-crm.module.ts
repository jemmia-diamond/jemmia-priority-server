import { Module } from '@nestjs/common';
import { SyncCrmService } from './sync-crm.service';
import { SyncCrmController } from './sync-crm.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CouponRef } from '../coupon-ref/entities/coupon-ref.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CouponRef])],
  controllers: [SyncCrmController],
  providers: [SyncCrmService],
})
export class SyncCrmModule {}
