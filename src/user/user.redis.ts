import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { User } from './entities/user.entity';

@Injectable()
export class UserRedis {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cache: Cache,
  ) {}

  async set(userId: string, data: User) {
    await this.cache.set(`USER_${userId}`, JSON.stringify(data));
  }

  async get(userId: string) {
    return JSON.parse(await this.cache.get(`USER_${userId}`)) as User;
  }
}
