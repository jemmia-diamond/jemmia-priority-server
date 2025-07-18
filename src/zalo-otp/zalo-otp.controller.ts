import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ZaloOtpService } from './zalo-otp.service';
import { SendOtpDto, VerifyOtpDto } from './dto/send-otp.dto';
import { SetZaloTokenDto } from './dto/set-zalo-token.dto';
import { ZaloTokenService } from './zalo-token.service';

@Controller('zalo-otp')
export class ZaloOtpController {
  constructor(
    private readonly zaloOtpService: ZaloOtpService,
    private readonly zaloTokenService: ZaloTokenService,
  ) {}

  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  async sendOtp(@Body() body: SendOtpDto) {
    return this.zaloOtpService.sendOtp(body.phone);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() body: VerifyOtpDto) {
    return this.zaloOtpService.verifyOtp(body.phone, body.otp);
  }

  @Post('set-zalo-token')
  @HttpCode(HttpStatus.OK)
  async setZaloToken(@Body() body: SetZaloTokenDto) {
    return this.zaloTokenService.saveInitialToken(body);
  }
}
