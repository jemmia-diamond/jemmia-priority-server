import { Injectable } from '@nestjs/common';
import { AuthDto } from './dto/auth.dto';
import { OAuth2Client } from 'google-auth-library';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { AccessTokenPayload, RefreshTokenPayload } from './types/jwt.types';
import { StringUtils } from '../utils/string.utils';
import { authenticator } from 'otplib';
import { jwtConstants } from './constants';

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
    //     process.env.GOOGLE_CLIENT_ID_IOS,
    //     process.env.GOOGLE_CLIENT_ID_ANDROID,
    //   ],
    // });
    // return ticket.getPayload();
    // return await firebaseAdmin.auth().verifyIdToken(idToken);
    //!FIXME: VERIFY GOOGLE ID TOKEN
    return this.jwtService.decode(idToken);
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

  async generateTOTPSecret(authId: string) {
    const secret = authenticator.generateSecret();

    const otpauthUrl = authenticator.keyuri(
      authId,
      process.env.TOTP_ISSUER,
      secret,
    );

    return {
      secret,
      otpauthUrl,
    };
  }

  verifyTOTPCode(code: string, secret: string) {
    return authenticator.verify({
      token: code,
      secret: secret,
    });
  }

  async oauth(payload: AuthDto) {
    //VERIFY OAUTH TOKEN
    const tokenPayload = await this.verifyOAuth(payload.token);
    const userExists = await this.userRepository.exists({
      where: { authId: tokenPayload.email },
    });

    let user: User;
    let isFirstLogin = false;
    let refreshToken: string;

    if (userExists) {
      //LOGIN
      user = await this.userRepository.findOne({
        where: {
          authId: tokenPayload.email,
        },
        relations: ['wallet'],
      });

      refreshToken = await this.signRefreshToken({
        id: user.id,
        authId: tokenPayload.email,
        sub: user.id,
      });

      user.refreshToken = refreshToken;
      await this.userRepository.save(user);
    } else {
      //REGISTER
      isFirstLogin = true;
      // const bscWallet = await this.walletService.create(EWeb3Client.bsc);
      // const bscWalletKeyStore = bscWallet.encrypt(
      //   process.env.WALLET_PRIVATE_KEY_SECRET,
      // );

      //Generate TOTP secret
      const totp = await this.generateTOTPSecret(tokenPayload.email);

      // const wallet = await this.walletRepository.save({
      //   walletAddress: tokenPayload.email,
      //   bscWalletAddress: bscWallet.address,
      //   bscWalletKeyStore,
      // });

      user = await this.userRepository.save({
        authId: tokenPayload.email,
        name: tokenPayload.name || payload.name,
        phoneNumber: payload.phoneNumber,
        avatarUrl: tokenPayload.picture,
        inviteCode: StringUtils.random(6),
        totpSecret: totp.secret,
      });

      refreshToken = await this.signRefreshToken({
        id: user.id,
        authId: tokenPayload.email,
        sub: user.id,
      });

      user.refreshToken = refreshToken;
      await this.userRepository.save(user);
    }

    const accessToken = await this.signAccessToken({
      id: user.id,
      name: tokenPayload.name,
      authId: tokenPayload.email,
      sub: user.id,
    });

    return {
      isFirstLogin,
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
      name: user.name,
      authId: user.authId,
      sub: user.id,
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
