import { Request } from 'express';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../user/entities/user.entity';
import { Repository } from 'typeorm';
import { RefreshTokenPayload } from '../types/jwt.types';
import { Config } from '../../shared/constants/config.constants';
import { jwtConstants } from '../constants';

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'refresh_token',
) {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: Config.dev,
      secretOrKey: jwtConstants.refreshTokenSecret,
      passReqToCallback: true,
    });
  }

  async validate(request: Request, payload: RefreshTokenPayload) {
    return await this.userRepository.findOneBy({
      id: payload.id,
      refreshToken: request.headers.authorization.split('Bearer ')[1],
    });
  }
}
