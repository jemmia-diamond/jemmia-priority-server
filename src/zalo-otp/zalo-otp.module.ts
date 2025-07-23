// zalo-otp.module.ts

import { Module } from '@nestjs/common';
import { ZaloOtpService } from './zalo-otp.service';
import { ZaloOtpController } from './zalo-otp.controller';
import { OtpRedis } from './zalo-otp.redis';

@Module({
  controllers: [ZaloOtpController],
  providers: [ZaloOtpService, OtpRedis],
  exports: [ZaloOtpService],
  imports: [],
})
export class ZaloOtpModule {}
