import { Injectable } from '@nestjs/common';

@Injectable()
export class ZnsCallbackWaiter {
  private waiters = new Map<string, (data: any) => void>();

  waitFor(requestId: string, timeout = 60000): Promise<any> {
    return new Promise((resolve) => {
      this.waiters.set(requestId, resolve);

      setTimeout(() => {
        if (this.waiters.has(requestId)) {
          this.waiters.delete(requestId);
          resolve({ status: 'timeout' });
        }
      }, timeout);
    });
  }

  resolve(requestId: string, data: any) {
    const resolver = this.waiters.get(requestId);
    if (resolver) {
      resolver(data);
      this.waiters.delete(requestId);
    }
  }
}
