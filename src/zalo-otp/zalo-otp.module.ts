// zalo-otp.module.ts

import { Module } from '@nestjs/common';
import { ZaloOtpService } from './zalo-otp.service';
import { ZaloOtpController } from './zalo-otp.controller';
import { OtpRedis } from './zalo-otp.redis';
import { ZaloTokenService } from './zalo-token.service';

@Module({
  controllers: [ZaloOtpController],
  providers: [ZaloOtpService, OtpRedis, ZaloTokenService],
})
export class ZaloOtpModule {}
