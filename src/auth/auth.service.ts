import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AuthDto } from './dto/auth.dto';
import { OAuth2Client } from 'google-auth-library';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { AccessTokenPayload, RefreshTokenPayload } from './types/jwt.types';
import { jwtConstants } from './constants';
import * as firebaseAdmin from 'firebase-admin';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  private oauthClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  );

  async verifyOAuth(idToken: string) {
    // const ticket = await this.oauthClient.verifyIdToken({
    //   idToken: idToken,
    //   audience: [
    //     process.env.GOOGLE_CLIENT_ID_WEB,
    //     process.env.GOOGLE_CLIENT_ID_ADMIN,
    //   ],
    // });
    // return ticket.getPayload();

    return firebaseAdmin.auth().verifyIdToken(idToken);
  }

  async signAccessToken(payload: AccessTokenPayload) {
    return this.jwtService.sign(payload, {
      secret: jwtConstants.accessTokenSecret,
      expiresIn: jwtConstants.accessTokenLiveTime,
    });
  }

  async signRefreshToken(payload: RefreshTokenPayload) {
    return this.jwtService.sign(payload, {
      secret: jwtConstants.refreshTokenSecret,
      expiresIn: jwtConstants.refreshTokenLiveTime,
    });
  }

  async oauth(payload: AuthDto) {
    //VERIFY OAUTH TOKEN
    const tokenPayload = await this.verifyOAuth(payload.token);
    const user = await this.userRepository.findOne({
      where: [
        {
          authId: tokenPayload.email,
        },
        // {
        //   authId: tokenPayload.phone_number,
        // },
      ],
    });

    if (!user) {
      throw new HttpException('USER_NOT_FOUND', HttpStatus.UNAUTHORIZED);
    }
    //LOGIN
    const refreshToken = await this.signRefreshToken({
      id: user.id,
      authId: user.authId,
      sub: user.id,
    });

    user.refreshToken = refreshToken;
    await this.userRepository.save(user);

    //REGISTER
    //!TODO: SYNC HARAVAN CUSTOMER AND PUT ID INTO THIS IF USER EXIST ON HARAVAN
    // user = await this.userRepository.save({
    //   authId: tokenPayload.phone_number,
    //   phoneNumber: tokenPayload.phone_number,
    //   inviteCode: StringUtils.random(6),
    //   haravanId: tokenPayload.phone_number,
    //   role
    // });

    const accessToken = await this.signAccessToken({
      id: user.id,
      authId: user.authId,
      sub: user.id,
      role: user.role,
      haravanId: user.haravanId.toString(),
    });

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  async refreshToken(user: User) {
    if (!user) {
      return;
    }

    const accessToken = await this.signAccessToken({
      id: user.id,
      role: user.role,
      authId: user.authId,
      sub: user.id,
      haravanId: user.haravanId.toString(),
    });

    const refreshToken = await this.signRefreshToken({
      id: user.id,
      authId: user.authId,
      sub: user.id,
    });

    user.refreshToken = refreshToken;
    await this.userRepository.save(user);

    return {
      accessToken,
      refreshToken,
    };
  }
}
