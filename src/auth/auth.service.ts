import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AuthDto } from './dto/auth.dto';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { AccessTokenPayload, RefreshTokenPayload } from './types/jwt.types';
import { jwtConstants } from './constants';
import * as firebaseAdmin from 'firebase-admin';
import { HaravanService } from '../haravan/haravan.service';
import { EUserRole } from '../user/enums/user-role.enum';
import { CouponRefService } from '../coupon-ref/coupon-ref.service';
import { CouponRef } from '../coupon-ref/entities/coupon-ref.entity';
import { ECustomerRankNum } from '../customer-rank/enums/customer-rank.enum';
import { CrmService } from '../crm/crm.service';
import { UserService } from '../user/user.service';
import { CrmCustomerDto } from '../crm/dto/crm-customer.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(CouponRef)
    private couponRefRepository: Repository<CouponRef>,
    private jwtService: JwtService,
    private haravanService: HaravanService,
    private crmService: CrmService,
    private userService: UserService,
    private couponRefService: CouponRefService,
  ) {}

  async verifyOAuth(idToken: string) {
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
    const fPhoneNum = tokenPayload.phone_number?.replace(/^\+84/, '0');
    let crmCusData: CrmCustomerDto;

    if (fPhoneNum) {
      crmCusData = (
        await this.crmService.findAllCustomer({
          limit: 1,
          query: {
            'phones.value': fPhoneNum,
          },
        })
      ).data?.[0];

      console.log(crmCusData);
    }

    console.log(tokenPayload);

    //Trường hợp user k phải admin & cũng không phải khách hàng haravan
    if (!tokenPayload.email && !crmCusData) {
      throw new HttpException('USER_NOT_FOUND', HttpStatus.UNAUTHORIZED);
    }

    let user = await this.userRepository.findOne({
      where: [
        {
          //Admin account query
          authId: tokenPayload.email,
          role: tokenPayload.email ? EUserRole.admin : null,
        },
        {
          //Customer account query
          crmId: crmCusData?.id,
        },
      ],
    });

    if (user) {
      //Sync thời gian login lần cuối qua CRM
      await this.userService.updateCrmLastLoginDate(crmCusData.id, new Date());
    } else {
      //Sync lần login lần đầu qua CRM
      await this.userService.updateCrmFirstLoginDate(crmCusData.id, new Date());
    }

    //Sync dữ liệu khách hàng từ CRM sang
    if (crmCusData) {
      user = await this.userService.syncFromCrm(crmCusData.id);
    }

    //LOGIN
    const refreshToken = await this.signRefreshToken({
      id: user.id,
      authId: user.authId,
      sub: user.id,
    });

    user.refreshToken = refreshToken;
    await this.userRepository.save(user);

    const accessToken = await this.signAccessToken({
      id: user.id,
      authId: user.authId,
      sub: user.id,
      role: user.role,
      haravanId: user.haravanId?.toString(),
    });

    return {
      accessToken,
      refreshToken,
      user: {
        ...user,
        haravan: crmCusData || {},
        crm: crmCusData,
        rank: user?.rank || ECustomerRankNum.silver,
        role: user?.role || EUserRole.customer,
      },
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
