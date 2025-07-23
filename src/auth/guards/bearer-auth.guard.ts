import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class BearerAuthGuard implements CanActivate {
  private readonly validToken = process.env.BEARER_TOKEN;

  canActivate(context: ExecutionContext): boolean {
    if (!this.validToken) {
      throw new UnauthorizedException('Bearer token not configured');
    }

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
