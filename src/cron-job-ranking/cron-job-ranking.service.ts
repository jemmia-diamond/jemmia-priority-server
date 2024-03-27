import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Order } from '../order/entities/order.entity';
import {
  ECustomerRank,
  ECustomerRankConfig,
  ECustomerRankNum,
} from '../customer-rank/enums/customer-rank.enum';
import { paymentStatusEnum } from '../order/enum/payment-status.dto';

@Injectable()
export class CronJobProvider implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {}

  onModuleInit() {
    this.handleCron(); // Kích hoạt cron job ngay khi module được khởi tạo
  }

  @Cron('0 0 1 * *')
  async handleCron() {
    console.log('Cron job is running on the 1st of every month');
    await this.ranking();
  }

  async ranking() {
    try {
      const listUser = await this.userRepository.find();

      const promises = [];
      listUser.forEach((user: User) => {
        promises.push(
          new Promise(async (resolve) => {
            // Process each user here
            const totalPrice = await this.getTotalPriceForUserLast12Months(
              user.id,
            );
            const cashBackRef = await this.getCashBackRefForUserLast12Months(
              user.id,
            );
            const cashBackRefA = await this.getCashBackRefAForUserLast12Months(
              user.id,
            );

            const total = totalPrice + cashBackRef + cashBackRefA;

            const customerRank = this.getCustomerRank(totalPrice, total);

            const rankNum = ECustomerRankNum[customerRank];

            if (rankNum > 1) {
              user.rankPoint =
                rankNum >= user.rankPoint ? rankNum : user.rankPoint - 1;
              await this.userRepository.save(user);
            }
            resolve(1);
          }),
        );
      });

      await Promise.race(promises);
    } catch (error) {
      console.log(error);
    }
  }

  async getTotalPriceForUserLast12Months(userId: string): Promise<number> {
    const currentDate = new Date();
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(currentDate.getMonth() - 12);
    const paymentStatus = paymentStatusEnum.CONFIRM;

    const query = this.orderRepository
      .createQueryBuilder('orders')
      .leftJoin('orders.user', 'user')
      .select('SUM(orders.totalPrice)', 'total')
      .where('user.id = :userId', { userId })
      .andWhere('orders.paymentStatus = :paymentStatus', { paymentStatus })
      .andWhere('orders.createdDate >= :twelveMonthsAgo', { twelveMonthsAgo })
      .andWhere('orders.createdDate <= :currentDate', { currentDate });

    const result = await query.getRawOne();
    const totalPrice = result.total;

    return totalPrice;
  }

  async getCashBackRefForUserLast12Months(userId: string): Promise<number> {
    const currentDate = new Date();
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(currentDate.getMonth() - 12);
    const paymentStatus = paymentStatusEnum.CONFIRM;

    const query = this.orderRepository
      .createQueryBuilder('orders')
      .leftJoin('orders.couponRef', 'couponRef')
      .leftJoin('couponRef.owner', 'user')
      .select('SUM(orders.cashBackRef)', 'total')
      .where('user.id = :userId', { userId })
      .andWhere('orders.paymentStatus = :paymentStatus', { paymentStatus })
      .andWhere('orders.createdDate >= :twelveMonthsAgo', { twelveMonthsAgo })
      .andWhere('orders.createdDate <= :currentDate', { currentDate });

    const result = await query.getRawOne();
    const totalPrice = result.total;

    return totalPrice;
  }

  async getCashBackRefAForUserLast12Months(userId: string): Promise<number> {
    const currentDate = new Date();
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(currentDate.getMonth() - 12);
    const paymentStatus = paymentStatusEnum.CONFIRM;

    const query = this.orderRepository
      .createQueryBuilder('orders')
      .leftJoin('orders.couponRef', 'couponRef')
      .leftJoin('couponRef.partnerCoupon', 'partnerCoupon')
      .leftJoin('partnerCoupon.owner', 'user')
      .select('SUM(orders.cashBackRefA)', 'total')
      .where('user.id = :userId', { userId })
      .andWhere('orders.paymentStatus = :paymentStatus', { paymentStatus })
      .andWhere('orders.createdDate >= :twelveMonthsAgo', { twelveMonthsAgo })
      .andWhere('orders.createdDate <= :currentDate', { currentDate });

    const result = await query.getRawOne();
    const totalPrice = result.total;

    return totalPrice;
  }

  getCustomerRank(buyPoint: number, refPoint: number): ECustomerRank {
    let customerRank: ECustomerRank = ECustomerRank.none;

    Object.entries(ECustomerRankConfig).forEach(([rank, config]) => {
      if (buyPoint >= config.buyPoint && refPoint >= config.refPoint) {
        customerRank = rank as ECustomerRank;
      }
    });

    return customerRank;
  }
}
