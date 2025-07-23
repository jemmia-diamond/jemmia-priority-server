import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { SendOtpDto, VerifyOtpDto } from './dto/send-otp.dto';
import { ZaloOtpService } from './zalo-otp.service';

@Controller('zalo-otp')
export class ZaloOtpController {
  constructor(private readonly zaloOtpService: ZaloOtpService) {}

  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  async sendOtp(@Body() body: SendOtpDto) {
    return this.zaloOtpService.sendOtp(body.phone);
  }
}
