import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategy/jwt.strategy';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './guards/roles.guard';
import { HaravanModule } from '../haravan/haravan.module';
import { CouponRefModule } from '../coupon-ref/coupon-ref.module';
import { CouponRef } from '../coupon-ref/entities/coupon-ref.entity';
import { CrmModule } from '../crm/crm.module';
import { UserModule } from '../user/user.module';
import { ZaloOtpModule } from '../zalo-otp/zalo-otp.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, CouponRef]),
    JwtModule.register({}),
    HaravanModule,
    CouponRefModule,
    CrmModule,
    UserModule,
    ZaloOtpModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AuthModule {}
