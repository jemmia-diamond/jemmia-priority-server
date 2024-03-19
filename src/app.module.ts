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
import { Coupon } from './coupon/entities/coupon.entity';
import { CouponUser } from './coupon/entities/coupon-user.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mariadb',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      password: process.env.DB_PASSWORD,
      username: process.env.DB_UNAME,
      entities: [User, Coupon, CouponUser],
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
  ],
  providers: [],
})
export class AppModule {}
