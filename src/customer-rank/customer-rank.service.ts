import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Order } from '../order/entities/order.entity';
import {
  ECustomerRank,
  ECustomerRankConfig,
  ECustomerRankNum,
} from './enums/customer-rank.enum';
import { EPaymentStatus } from '../order/enum/payment-status.dto';
import { EFinancialStatus } from '../haravan/dto/haravan-order.dto';

@Injectable()
export class CustomerRankService implements OnModuleInit {
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
            const currentDate = new Date();
            currentDate.setFullYear(currentDate.getFullYear() - 1);
            if (user.rankExpirationTime >= currentDate) {
              const rankNum = await this.getRankOfUser(user.id);

              if (rankNum > 1) {
                if (user.rank != ECustomerRankNum.silver)
                  user.rank =
                    rankNum >= user.rankPoint ? rankNum : user.rank - 1;
                user.rankExpirationTime = new Date();
                await this.userRepository.save(user);
              }
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

  async calculateUserRank(user: User) {
    try {
      const rankNum = await this.getRankOfUser(user.id);
      let rank: ECustomerRankNum;

      if (rankNum > 1) {
        if (user.rank != ECustomerRankNum.silver)
          rank = rankNum >= user.rankPoint ? rankNum : user.rank - 1;

        return rank;
      }
      return rankNum;
    } catch (error) {
      console.log(error);
    }
  }

  async getRankOfUser(userId: string) {
    try {
      const currenPoint = await this.getTotalBuyAndCashBackRef(userId);
      console.log(currenPoint);
      const customerRank = this.calculateCustomerRank(
        currenPoint.totalPrice,
        currenPoint.total,
      );
      console.log(customerRank);

      return ECustomerRankNum[customerRank];
    } catch (error) {
      console.log(error);
    }
  }

  async getTotalBuyAndCashBackRef(userId: string) {
    try {
      const totalPrice = await this.getTotalPriceForUserLast12Months(userId);
      const cashBackRef = await this.getCashBackRefForUserLast12Months(userId);
      const cashBackRefA =
        await this.getCashBackRefAForUserLast12Months(userId);

      const total = totalPrice + cashBackRef + cashBackRefA;
      return {
        totalPrice,
        total,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async getTotalPriceForUserLast12Months(userId: string): Promise<number> {
    const currentDate = new Date();
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(currentDate.getMonth() - 12);
    const paymentStatus = EFinancialStatus.paid;

    const query = this.orderRepository
      .createQueryBuilder('orders')
      .innerJoin('orders.user', 'user')
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
    const paymentStatus = EPaymentStatus.CONFIRM;

    const query = this.orderRepository
      .createQueryBuilder('orders')
      .innerJoin('orders.couponRef', 'couponRef')
      .innerJoin('couponRef.owner', 'user')
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
    const paymentStatus = EPaymentStatus.CONFIRM;

    const query = this.orderRepository
      .createQueryBuilder('orders')
      .innerJoin('orders.couponRef', 'couponRef')
      .innerJoin('couponRef.owner', 'user')
      .innerJoin('user.invitedBy', 'userInvite')
      .select('SUM(orders.cashBackRefA)', 'total')
      .where('userInvite.id = :userId', { userId })
      .andWhere('orders.paymentStatus = :paymentStatus', { paymentStatus })
      .andWhere('orders.createdDate >= :twelveMonthsAgo', { twelveMonthsAgo })
      .andWhere('orders.createdDate <= :currentDate', { currentDate });

    const result = await query.getRawOne();
    const totalPrice = result.total;

    return totalPrice;
  }

  calculateCustomerRank(buyPoint: number, refPoint: number): ECustomerRank {
    for (const [rank, config] of Object.entries(ECustomerRankConfig)) {
      console.log(config);
      if (
        buyPoint >= config.buyPoint &&
        refPoint >= config.refPoint &&
        rank != ECustomerRank.staff
      ) {
        return rank as ECustomerRank;
      }
    }

    return ECustomerRank.none;
  }

  async getRankInfo(userId: string) {
    try {
      const currentDate = new Date();

      const user = await this.userRepository.findOneBy({ id: userId });
      if (!user) throw new BadRequestException('User not found!');

      let currentRank = await this.getRankOfUser(user.id);

      currentRank =
        currentRank < user.rank
          ? user.rank == ECustomerRankNum.silver
            ? user.rank
            : user.rank - 1
          : currentRank;

      const currentPoint = await this.getTotalBuyAndCashBackRef(userId);

      const nextRank =
        currentRank == ECustomerRankNum.platinum ||
        currentRank == ECustomerRankNum.none
          ? currentRank
          : currentRank + 1;

      const nextBuyPoint =
        ECustomerRankConfig[ECustomerRankNum[nextRank]].buyPoint;
      const nextRefPoint =
        ECustomerRankConfig[ECustomerRankNum[nextRank]].buyPoint;

      const dataReturn = {
        setupTime: new Date(currentDate.setDate(currentDate.getDate() + 30)),
        currentRank: {
          name: ECustomerRankNum[currentRank],
          buyPoint: currentPoint.totalPrice,
          refPoint: currentPoint.total,
        },
        nextRank: {
          name: ECustomerRankNum[nextRank],
          buyPoint: nextBuyPoint,
          refPoint: nextRefPoint,
        },
        pointNeed: {
          buyPoint:
            nextBuyPoint > currentPoint.totalPrice
              ? nextBuyPoint - currentPoint.totalPrice
              : 0,
          refPoint:
            nextRefPoint > currentPoint.total
              ? nextRefPoint - currentPoint.total
              : 0,
        },
        rankExpirationTime: !user.rankExpirationTime
          ? null
          : new Date(
              user.rankExpirationTime.setFullYear(
                user.rankExpirationTime.getFullYear() + 1,
              ),
            ),
      };

      return dataReturn;
    } catch (error) {
      console.log(error);
    }
  }
}
