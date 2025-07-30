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
      return false;
    }

    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return false;
    }

    const token = authHeader.split(' ')[1];

    if (token !== this.validToken) {
      return false;
    }

    return true;
  }
}
