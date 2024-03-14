import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HaravanModule } from '../haravan/haravan.module';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User]), HaravanModule],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
