import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { createHmac } from 'crypto';

@Injectable()
export class BearerAuthGuard implements CanActivate {
  private readonly validToken = process.env.PRIORITY_SECRET;

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Missing or malformed Authorization header',
      );
    }

    const token = authHeader.split(' ')[1];

    if (token !== this.validToken) {
      throw new UnauthorizedException('Invalid token');
    }

    return true;
  }
}
