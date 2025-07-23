// zalo-otp.service.ts

import { Injectable } from '@nestjs/common';
import { OtpRedis } from './zalo-otp.redis';
import axios from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class ZaloOtpService {
  constructor(private readonly otpRedis: OtpRedis) {}

  async sendOtp(phone: string) {
    if (!phone) throw new Error('Phone is required');

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const clientId = process.env.ZALOPAY_CLIENT_ID;
    const secretKey = process.env.ZALOPAY_SECRET_KEY;
    const requestId = Date.now().toString();

    const payloadObj = {
      zalo_oa_id: process.env.ZALOPAY_OA_ID,
      phone: phone,
      content: {
        template_id: Number(process.env.ZALOPAY_TEMPLATE_ID),
        template_data: {
          customer_name: 'User',
          phone: phone,
          day: 'today',
          total_amount: '0',
          order_code: otp,
          order_status: 'Mã OTP',
        },
      },
      callback_url: 'http://cms.zalopay.test/zns/v1/callback',
    };

    const payload = JSON.stringify(payloadObj);
    const hashData = `${clientId}|${requestId}|${payload}`;

    const xClientHash = crypto
      .createHmac('sha256', secretKey)
      .update(hashData)
      .digest('hex');

    try {
      await this.otpRedis.set(phone, otp); // Save OTP

      const response = await axios.post(
        'https://dev.zalopay.vn/zns-partner/v1/messages',
        payloadObj,
        {
          headers: {
            'x-client-hash': xClientHash,
            'x-client-id': clientId,
            'x-request-id': requestId,
            'Content-Type': 'application/json',
          },
        },
      );
      if (response.data.meta.code === '200') {
        return { status: 200, message: 'OTP sent successfully via ZaloPay' };
      } else {
        return {
          status: 500,
          message: 'Failed to send OTP via ZaloPay',
          error: response.data,
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
    return { status: 200, message: 'OTP verified successfully' };
  }
}
