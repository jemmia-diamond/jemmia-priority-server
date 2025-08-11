import {
  Body,
  Controller,
  Post,
  Headers,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ZaloOtpService } from './zalo-otp.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { Request } from 'express';
import { BearerAuthGuard } from '../auth/guards/bearer-auth.guard';

@Controller('zalo-otp')
export class ZaloOtpController {
  constructor(private readonly zaloOtpService: ZaloOtpService) {}

  @UseGuards(BearerAuthGuard)
  @Post('send-otp')
  async sendOtp(@Body() sendOtpDto: SendOtpDto, @Req() req: Request) {
    const domain = `${req.protocol}://${req.get('host')}`;
    return this.zaloOtpService.sendOtp(sendOtpDto.phone, domain);
  }

  @Post('v1/callback')
  async handleZaloCallback(
    @Headers('x-client-id') clientId: string,
    @Headers('x-request-id') requestId: string,
    @Body() body: any,
  ) {
    return this.zaloOtpService.handleZnsCallback(clientId, requestId, body);
  }
}
