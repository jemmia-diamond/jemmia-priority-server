import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { HaravanModule } from '../haravan/haravan.module';
import { CouponRefModule } from '../coupon-ref/coupon-ref.module';
import { UserRedis } from './user.redis';
import { UserEntitySubscriber } from './subscribers/user-entity.subscriber';
import { CrmModule } from '../crm/crm.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    HaravanModule,
    CouponRefModule,
    CrmModule,
  ],
  controllers: [UserController],
  providers: [UserService, UserRedis, UserEntitySubscriber],
  exports: [UserService, UserRedis],
})
export class UserModule {}
