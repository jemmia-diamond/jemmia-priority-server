// zalo-otp.service.ts

import { Injectable } from '@nestjs/common';
import { OtpRedis } from './zalo-otp.redis';
import axios from 'axios';
import { ZaloTokenService } from './zalo-token.service';

@Injectable()
export class ZaloOtpService {
  private readonly zaloTokenService: ZaloTokenService;
  private readonly ZALO_OTP_TEMPLATE_ID = process.env.ZALO_OTP_TEMPLATE_ID;

  constructor(
    private readonly otpRedis: OtpRedis,
    zaloTokenService: ZaloTokenService,
  ) {
    this.zaloTokenService = zaloTokenService;
  }

  async sendOtp(phone: string) {
    if (!phone) throw new Error('Phone is required');

    const ZALO_ACCESS_TOKEN = await this.zaloTokenService.getAccessToken();
    if (!ZALO_ACCESS_TOKEN) {
      throw new Error('Zalo access token not available');
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(this.ZALO_OTP_TEMPLATE_ID, ZALO_ACCESS_TOKEN);
    try {
      await this.otpRedis.set(phone, otp);

      let result = await axios.post(
        'https://business.openapi.zalo.me/message/template',
        {
          phone: phone,
          template_id: this.ZALO_OTP_TEMPLATE_ID,
          template_data: { otp },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            access_token: ZALO_ACCESS_TOKEN,
          },
        },
      );
      if (result.data.error === 0) {
        return { status: 200, message: 'OTP sent successfully' };
      } else if (result.data.error === -118) {
        return { status: 404, message: 'Phone number not registered on Zalo' };
      } else {
        return {
          status: 500,
          message: 'Failed to send OTP',
          error: result.data,
        };
      }
    } catch (err) {
      throw new Error(
        `Failed to send OTP: ${JSON.stringify(err.response?.data || err.message)}`,
      );
    }
  }

  async verifyOtp(phone: string, otp: string) {
    if (!phone || !otp) throw new Error('Phone and OTP are required');

    const storedOtp = await this.otpRedis.get(phone);

    if (!storedOtp) {
      throw new Error('OTP expired or not found');
    }

    if (storedOtp !== otp) {
      throw new Error('Invalid OTP');
    }

    await this.otpRedis.del(phone);
    return { status: 'OTP verified successfully' };
  }
}
