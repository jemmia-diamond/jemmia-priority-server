import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConstants } from '../constants';
import { AccessTokenPayload } from '../types/jwt.types';
import { Config } from '../../shared/constants/config.constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: Config.dev,
      secretOrKey: jwtConstants.accessTokenSecret,
    });
  }

  async validate(payload: AccessTokenPayload) {
    return payload;
  }
}
