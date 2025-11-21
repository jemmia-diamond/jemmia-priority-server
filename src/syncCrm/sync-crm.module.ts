import { Module } from '@nestjs/common';
import { SyncCrmService } from './sync-crm.service';
import { SyncCrmController } from './sync-crm.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CouponRef } from '../coupon-ref/entities/coupon-ref.entity';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CouponRef, User])],
  controllers: [SyncCrmController],
  providers: [SyncCrmService],
})
export class SyncCrmModule {}
