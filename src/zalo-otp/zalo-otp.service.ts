// zalo-otp.service.ts

import { Injectable } from '@nestjs/common';
import { OtpRedis } from './zalo-otp.redis';
import axios from 'axios';
import * as crypto from 'crypto';
import { ZnsCallbackWaiter } from './zns-callback-waiter';

@Injectable()
export class ZaloOtpService {
  constructor(
    private readonly otpRedis: OtpRedis,
    private readonly znsCallbackWaiter: ZnsCallbackWaiter,
  ) {}

  async sendOtp(phone: string, domain: string) {
    if (!phone) throw new Error('Phone is required');
    const callbackUrl = `${domain}/zalo-otp/v1/callback`;

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Define static ZaloPay credentials
    const clientId = process.env.ZALOPAY_CLIENT_ID;
    const secretKey = process.env.ZALOPAY_SECRET_KEY;
    const requestId = Date.now().toString(); // Or use uuid if preferred

    const payloadObj = {
      zalo_oa_id: process.env.ZALOPAY_OA_ID,
      phone: phone,
      content: {
        template_id: Number(process.env.ZALOPAY_TEMPLATE_ID),
        template_data: {
          otp: otp,
        },
      },
      callback_url: callbackUrl,
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
        'https://api-partner.zalopay.vn/zns-partner/v1/messages',
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
      const callbackResult = await this.znsCallbackWaiter.waitFor(
        requestId,
        60000,
      );

      if (callbackResult.status === 1) {
        return { status: 200, message: 'OTP sent successfully via Zalo' };
      } else if (callbackResult.status === 'timeout') {
        return { status: 504, message: 'Timeout waiting for Zalo callback' };
      } else {
        return { status: 500, message: 'Failed to send OTP via Zalo' };
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

  async handleZnsCallback(clientId: string, requestId: string, body: any) {
    const { data } = body;
    if (!data?.message_id) {
      throw new Error('Invalid callback: missing message_id');
    }
    this.znsCallbackWaiter.resolve(requestId, data);
    return { status: 'ok' };
  }
}
