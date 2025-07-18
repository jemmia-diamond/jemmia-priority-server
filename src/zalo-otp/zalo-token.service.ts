import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import axios from 'axios';

interface ZaloTokenPayload {
  access_token: string;
  access_token_expires_at: number;
  refresh_token: string;
  refresh_token_expires_at: number;
  last_updated: number;
}

@Injectable()
export class ZaloTokenService {
  private readonly TOKEN_KEY = 'zalo:token';
  private readonly tokenUrl = 'https://oauth.zaloapp.com/v4/oa/access_token';
  private readonly clientId = process.env.ZALO_CLIENT_ID;
  private readonly clientSecret = process.env.ZALO_CLIENT_SECRET;

  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async getAccessToken(): Promise<string> {
    const now = Date.now();
    const token = await this.cache.get<ZaloTokenPayload>(this.TOKEN_KEY);

    if (!token) {
      throw new Error('Zalo token not initialized');
    }

    if (token.access_token_expires_at > now) {
      return token.access_token;
    }

    // Access token expired → refresh
    return this.refreshToken(token);
  }

  private async refreshToken(oldToken: ZaloTokenPayload): Promise<string> {
    const now = Date.now();

    if (oldToken.refresh_token_expires_at < now) {
      throw new Error('Zalo refresh token has expired');
    }

    try {
      const response = await axios.post(
        this.tokenUrl,
        {
          grant_type: 'refresh_token',
          refresh_token: oldToken.refresh_token,
          app_id: this.clientId,
        },
        {
          headers: {
            secret_key: this.clientSecret, // hoặc process.env.ZALO_SECRET_KEY nếu bạn tách ra
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      const data = response.data;

      const newToken: ZaloTokenPayload = {
        access_token: data.access_token,
        access_token_expires_at: now + data.expires_in,
        refresh_token: data.refresh_token,
        refresh_token_expires_at: now + data.refresh_token_expires_in,
        last_updated: now,
      };

      await this.cache.set(this.TOKEN_KEY, newToken);
      return newToken.access_token;
    } catch (err) {
      throw new Error(
        'Failed to refresh Zalo token: ' +
          JSON.stringify(err.response?.data || err.message),
      );
    }
  }

  async saveInitialToken(data: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    refresh_token_expires_in: number;
  }): Promise<void> {
    const now = Date.now();

    const token: ZaloTokenPayload = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      access_token_expires_at: now + data.expires_in,
      refresh_token_expires_at: now + data.refresh_token_expires_in,
      last_updated: now,
    };
    await this.cache.set(this.TOKEN_KEY, token);
  }
}
