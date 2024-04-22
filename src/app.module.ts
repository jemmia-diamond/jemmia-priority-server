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
import { NotificationModule } from './notification/notification.module';
import { Notification } from './notification/entities/notification.entity';
import { WithdrawModule } from './withdraw/withdraw.module';
import { Withdraw } from './withdraw/entities/withdraw.entity';
import { Post } from './blog/entities/post.entity';
import { Blog } from './blog/entities/blog.entity';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';
import { CrmModule } from './crm/crm.module';

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async (): Promise<any> => {
        const store = await redisStore({
          socket: {
            host: process.env.REDIS_HOST,
            port: Number(process.env.REDIS_PORT),
          },
          password: process.env.REDIS_PASSWORD,
        });
        return {
          store: () => store,
        };
      },
    }),
    TypeOrmModule.forRoot({
      type: 'mariadb',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      password: process.env.DB_PASSWORD,
      username: process.env.DB_UNAME,
      // acquireTimeout: 60 * 60 * 1000,
      // connectTimeout: 60 * 60 * 1000,
      // poolSize: 1,
      entities: [
        User,
        Coupon,
        CouponRedeemed,
        CouponRef,
        Order,
        Withdraw,
        Notification,
        Post,
        Blog,
      ],
      database: process.env.DB,
      synchronize: true,
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
    NotificationModule,
    WithdrawModule,
    CrmModule,
  ],
  providers: [],
  controllers: [],
})
export class AppModule {}
