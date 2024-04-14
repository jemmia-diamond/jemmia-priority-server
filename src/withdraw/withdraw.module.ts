import { Module } from '@nestjs/common';
import { WithdrawService } from './withdraw.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Withdraw } from './entities/withdraw.entity';
import { WithdrawController } from './withdraw.controller';
import { UserModule } from '../user/user.module';
import { Notification } from '../notification/entities/notification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Withdraw, Notification]), UserModule],
  controllers: [WithdrawController],
  providers: [WithdrawService],
  exports: [WithdrawService],
})
export class WithdrawModule {}
