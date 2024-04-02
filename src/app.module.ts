import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/entities/user.entity';
import { AuthModule } from './auth/auth.module';
import { HaravanModule } from './haravan/haravan.module';
import { UserModule } from './user/user.module';
import { BlogModule } from './blog/blog.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { InformationModule } from './information/information.module';
import { OrderModule } from './order/order.module';
import { CouponModule } from './coupon/coupon.module';
import { CouponRefModule } from './coupon-ref/coupon-ref.module';
import { Coupon } from './coupon/entities/coupon.entity';
import { CouponRedeemed } from './coupon/entities/coupon-user.entity';
import { CouponRef } from './coupon-ref/entities/coupon-ref.entity';
import { CustomerRankModule } from './customer-rank/customer-rank.module';
import { Order } from './order/entities/order.entity';
import { WithdrawModule } from './withdraw/withdraw.module';
import { Withdraw } from './withdraw/entities/withdraw.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mariadb',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      password: process.env.DB_PASSWORD,
      username: process.env.DB_UNAME,
      entities: [User, Coupon, CouponRedeemed, CouponRef, Order, Withdraw],
      database: process.env.DB,
      synchronize: false,
      logging: false,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    AuthModule,
    UserModule,
    HaravanModule,
    BlogModule,
    InformationModule,
    OrderModule,
    CouponModule,
    CouponRefModule,
    CustomerRankModule,
    WithdrawModule,
  ],
  providers: [],
  controllers: [],
})
export class AppModule {}
