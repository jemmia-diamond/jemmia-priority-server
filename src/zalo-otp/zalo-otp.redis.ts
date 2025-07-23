import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class OtpRedis {
  private readonly PREFIX = 'ZALO_OTP_';
  private readonly TTL_SECONDS = 300; // 5 minutes

  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cache: Cache,
  ) {}

  async set(phone: string, otp: string): Promise<void> {
    await this.cache.set(`${this.PREFIX}${phone}`, otp, this.TTL_SECONDS);
  }

  async get(phone: string): Promise<string | null> {
    const value = await this.cache.get<string>(`${this.PREFIX}${phone}`);
    return value || null;
  }

  async del(phone: string): Promise<void> {
    await this.cache.del(`${this.PREFIX}${phone}`);
  }
}
