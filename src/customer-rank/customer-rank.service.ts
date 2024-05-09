import {
  BadRequestException,
  Inject,
  Injectable,
  OnModuleInit,
  forwardRef,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Order } from '../order/entities/order.entity';
import {
  ECustomerRank,
  ECustomerRankConfig,
  ECustomerRankNum,
} from './enums/customer-rank.enum';
import { EPaymentStatus } from '../order/enum/payment-status.dto';
import { EFinancialStatus } from '../haravan/dto/haravan-order.dto';
import { EUserRole } from '../user/enums/user-role.enum';
import { UserService } from '../user/user.service';

@Injectable()
export class CustomerRankService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
  ) {}

  onModuleInit() {
    this.handleCron(); // Kích hoạt cron job ngay khi module được khởi tạo
  }

  @Cron('0 0 * * *')
  async handleCron() {
    console.log('Cron job is running on the 1st of every day');
    await this.ranking();
  }

  async ranking() {
    try {
      //!TODO HANDLE FOR CRM UPDATE REF POINT
      const listUser = await this.userRepository.find();

      const promises = [];
      listUser.forEach((user: User) => {
        promises.push(
          new Promise(async (resolve) => {
            // Process each user here
            const currentDate = new Date();
            if (user.rankExpirationTime >= currentDate) {
              const userRank = await this.getRankOfUser(user.id);

              if (userRank.rank > ECustomerRankNum.silver) {
                if (user.rank != ECustomerRankNum.silver)
                  user.rank =
                    userRank.rank >= user.rank ? userRank.rank : user.rank - 1;
                user.rankExpirationTime = new Date(
                  currentDate.setFullYear(currentDate.getFullYear() + 1),
                );
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

  /** Update rank của user và sync điểm ref qua CRM */
  async updateUserRank(user: User) {
    try {
      const u = await this.calcRankAndSetToUser(user);

      await this.userRepository.save(u);
    } catch (error) {
      console.log(error);
    }
  }

  //* Giống updateUserRank nhưng chỉ trả về giá trị & SYNC CRM REF POINT
  async calcRankAndSetToUser(user: User) {
    try {
      const currentRank = user.rank;
      const userRank = await this.getRankOfUser(user.id);
      const dateNow = new Date();

      if (userRank.rank > ECustomerRankNum.silver) {
        user.rank =
          userRank.rank >= user.rank //Nếu hạng tính ra lớn hơn thì thăng hạng
            ? userRank.rank
            : user.rankExpirationTime <= dateNow //Nếu hạng hết hạn & hạng tính ra nhỏ hơn hạng hiện tại thì giảm hạng
              ? user.rank - 1
              : user.rank; //Mặc định giữ hạng
      }

      if (user.rank !== currentRank) {
        user.rankUpdatedTime = dateNow;
        user.rankExpirationTime = new Date(
          dateNow.setFullYear(dateNow.getFullYear() + 1),
        );
      }

      //Sync ref point to CRM
      await this.userService.updateCrmRefPoint(
        user.crmId,
        userRank.currentPoint.totalRef,
      );

      return user;
    } catch (error) {
      console.log(error);
    }
  }

  async getRankOfUser(userId: string) {
    try {
      const currentPoint = await this.getTotalBuyAndCashBackRef(userId);
      const customerRank = this.calculateCustomerRank(
        currentPoint.totalPrice,
        currentPoint.totalRef,
      );

      return {
        rank: ECustomerRankNum[customerRank],
        currentPoint,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async getTotalBuyAndCashBackRef(userId: string) {
    try {
      // const totalPrice = await this.getTotalPriceForUserLast12Months(userId);
      //Use from CRM
      const user = await this.userRepository.findOneBy({ id: userId });
      const totalPrice = user.cumulativeTovRecorded;

      // const cashBackRef =
      //   await this.getCashBackRefFollowPriceForUserLast12Months(user);
      // const cashBackRefA = await this.getCashBackRefAForUserLast12Months(user);
      const totalRef = await this.getTotalRefPriceLastYear(user);

      // const totalRef = totalPrice + cashBackRef + cashBackRefA;
      return {
        totalPrice: totalPrice <= 0 ? 0 : totalPrice,
        totalRef: totalRef,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async getTotalPriceForUserLast12Months(userId: string): Promise<number> {
    const currentDate = new Date();
    currentDate.setMinutes(currentDate.getMinutes() + 5);

    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(currentDate.getMonth() - 12);
    const paymentStatus = EFinancialStatus.paid;

    const query = this.orderRepository
      .createQueryBuilder('orders')
      .innerJoin('orders.user', 'user')
      .select('SUM(orders.totalPrice)', 'total')
      .where('user.id = :userId', { userId })
      .andWhere('orders.paymentStatus = :paymentStatus', { paymentStatus })
      .andWhere('UNIX_TIMESTAMP(orders.createdDate) >= :twelveMonthsAgo', {
        twelveMonthsAgo: Math.floor(twelveMonthsAgo.getTime() / 1000),
      })
      .andWhere('UNIX_TIMESTAMP(orders.createdDate) <= :currentDate', {
        currentDate: Math.floor(currentDate.getTime() / 1000),
      });

    const result = await query.getRawOne();
    const totalPrice = result.total;

    return totalPrice;
  }

  /** Tổng doanh thu ref tích luỹ trong 12 tháng */
  async getTotalRefPriceLastYear(user: User): Promise<number> {
    if (!user.rankUpdatedTime) return 0;

    const twelveMonthsAgo = user.rankUpdatedTime;

    const totalPrice = await this.orderRepository.sum('totalPrice', {
      couponRef: {
        owner: user,
      },
      paymentStatus: EFinancialStatus.paid,
      createdDate: MoreThanOrEqual(twelveMonthsAgo),
    });

    return totalPrice || 0;
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
      .andWhere('UNIX_TIMESTAMP(orders.createdDate) >= :twelveMonthsAgo', {
        twelveMonthsAgo: Math.floor(twelveMonthsAgo.getTime() / 1000),
      })
      .andWhere('UNIX_TIMESTAMP(orders.createdDate) <= :currentDate', {
        currentDate: Math.floor(currentDate.getTime() / 1000),
      });

    const result = await query.getRawOne();
    const totalPrice = result.total;

    return totalPrice;
  }

  async getCashBackRefAForUserLast12Months(user: User): Promise<number> {
    if (!user.rankUpdatedTime) return 0;

    // const currentDate = new Date();
    const twelveMonthsAgo = user.rankUpdatedTime;
    // const paymentStatus = EPaymentStatus.CONFIRM;

    //Doanh thu = các đơn B1 của partnerA đã mời
    const totalPrice = await this.orderRepository.sum('totalPrice', {
      couponRef: {
        owner: {
          role: EUserRole.partnerB,
          invitedBy: {
            id: user.id,
            role: EUserRole.partnerA,
          },
        },
      },
      paymentStatus: EFinancialStatus.paid,
      createdDate: MoreThanOrEqual(twelveMonthsAgo),
    });

    // const query = this.orderRepository
    //   .createQueryBuilder('orders')
    //   .innerJoin('orders.couponRef', 'couponRef')
    //   .innerJoin('couponRef.owner', 'user')
    //   .innerJoin('user.invitedBy', 'userInvite')
    //   .select('SUM(orders.cashBackRefA)', 'total')
    //   .where('userInvite.id = :userId', { userId: user.id })
    //   .andWhere('orders.paymentStatus = :paymentStatus', { paymentStatus })
    //   .andWhere('UNIX_TIMESTAMP(orders.createdDate) >= :twelveMonthsAgo', {
    //     twelveMonthsAgo: Math.floor(twelveMonthsAgo.getTime() / 1000),
    //   })
    //   .andWhere('UNIX_TIMESTAMP(orders.createdDate) <= :currentDate', {
    //     currentDate: Math.floor(currentDate.getTime() / 1000),
    //   });

    // const result = await query.getRawOne();
    // const totalPrice = result.total;

    return totalPrice;
  }

  calculateCustomerRank(buyPoint: number, refPoint: number): ECustomerRank {
    for (const [rank, config] of Object.entries(ECustomerRankConfig)) {
      if (
        (buyPoint >= config.buyPoint || refPoint >= config.refPoint) &&
        rank != ECustomerRank.staff
      ) {
        return rank as ECustomerRank;
      }
    }
  }

  async getRankInfo(userId: string) {
    try {
      const currentDate = new Date();

      const user = await this.userRepository.findOneBy({ id: userId });
      if (!user) throw new BadRequestException('User not found!');

      const userRank = await this.getRankOfUser(user.id);

      const currentRank = userRank.rank < user.rank ? user.rank : userRank.rank;

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
          refPoint: currentPoint.totalRef,
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
            nextRefPoint > currentPoint.totalRef
              ? nextRefPoint - currentPoint.totalRef
              : 0,
        },
        rankExpirationTime: user.rankExpirationTime,
      };

      return dataReturn;
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  async getReport(userId: string) {
    try {
      const user = await this.userRepository.findOneBy({ id: userId });
      if (!user) throw new BadRequestException('User not found!');

      const totalPriceOfPartnerA = await this.getTotalPriceOfRole(
        EUserRole.partnerA,
      );
      const revenueOfPartnerA = await this.getRevenueOfPartnerA();
      const salesOfPartnerA = await this.getSalesOfPartnerA();
      const referralCountOfPartnerA = await this.getReferralCountOfPartnerA();

      const totalPriceOfPartnerB = await this.getTotalPriceOfRole(
        EUserRole.partnerB,
      );
      const revenueOfPartnerB = await this.getRevenueOfRoleDifferencePartnerA(
        EUserRole.partnerB,
      );
      const salesOfPartnerB = await this.getSalesOfRoleDifferencePartnerA(
        EUserRole.partnerB,
      );
      const referralCountOfPartnerB =
        await this.getReferralOfRoleDifferencePartnerA(EUserRole.partnerB);

      const totalPriceOfCustomer = await this.getTotalPriceOfRole(
        EUserRole.customer,
      );
      const revenueOfCustomer = await this.getRevenueOfRoleDifferencePartnerA(
        EUserRole.customer,
      );
      const salesOfCustomer = await this.getSalesOfRoleDifferencePartnerA(
        EUserRole.customer,
      );
      const referralCountOfCustomer =
        await this.getReferralOfRoleDifferencePartnerA(EUserRole.customer);

      const totalPriceOfStaff = await this.getTotalPriceOfRole(EUserRole.staff);
      const revenueOfStaff = await this.getRevenueOfRoleDifferencePartnerA(
        EUserRole.staff,
      );
      const salesOfStaff = await this.getSalesOfRoleDifferencePartnerA(
        EUserRole.staff,
      );
      const referralCountOfStaff =
        await this.getReferralOfRoleDifferencePartnerA(EUserRole.staff);

      const dataReturn = {
        partnerA: {
          totalPrice: totalPriceOfPartnerA,
          revenue: revenueOfPartnerA,
          sales: salesOfPartnerA,
          referralCount: referralCountOfPartnerA,
        },
        partnerB: {
          totalPrice: totalPriceOfPartnerB,
          revenue: revenueOfPartnerB,
          sales: salesOfPartnerB,
          referralCount: referralCountOfPartnerB,
        },
        customer: {
          totalPrice: totalPriceOfCustomer,
          revenue: revenueOfCustomer,
          sales: salesOfCustomer,
          referralCount: referralCountOfCustomer,
        },
        staff: {
          totalPrice: totalPriceOfStaff,
          revenue: revenueOfStaff,
          sales: salesOfStaff,
          referralCount: referralCountOfStaff,
        },
      };

      return dataReturn;
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  /**
   * Lấy tổng giá trị đơn hàng theo EUserRole đã thanh toán.
   * @returns Tổng giá trị đơn hàng.
   */
  async getTotalPriceOfRole(role: EUserRole): Promise<number> {
    const paymentStatus = EFinancialStatus.paid;

    const query = this.orderRepository
      .createQueryBuilder('orders')
      .innerJoin('orders.user', 'user')
      .select('SUM(orders.totalPrice)', 'total') // Tính tổng giá trị đơn hàng bằng cách sử dụng SUM(orders.totalPrice)
      .where('user.role = :role', { role })
      .andWhere('orders.paymentStatus = :paymentStatus', { paymentStatus });

    const result = await query.getRawOne();
    const totalPrice = result.total || 0;

    return totalPrice;
  }

  /**
   * Lấy tổng doanh thu từ đơn hàng của đối tác A đã thanh toán và được giới thiệu bởi đối tác B được mời bởi đối tác A.
   * @returns Tổng doanh thu.
   */
  async getRevenueOfPartnerA(): Promise<number> {
    const paymentStatus = EFinancialStatus.paid;

    const query = this.orderRepository
      .createQueryBuilder('orders')
      .innerJoin('orders.user', 'user')
      .innerJoin('user.invitedBy', 'invited')
      .leftJoin('invited.invitedBy', 'invitedByA')
      .select('SUM(orders.totalPrice)', 'total') // Tính tổng doanh thu bằng cách sử dụng SUM(orders.totalPrice)
      .andWhere(
        '(invited.role = :roleInvitedByA OR (invited.role = :roleInvited AND invitedByA.role = :roleInvitedByA))',
        {
          roleInvitedByA: EUserRole.partnerA,
          roleInvited: EUserRole.partnerB,
        },
      )
      .andWhere('orders.paymentStatus = :paymentStatus', { paymentStatus });

    const result = await query.getRawOne();
    const revenue = result.total || 0;

    return revenue;
  }

  /**
   * Lấy tổng doanh số từ các đơn hàng của đối tác A đã thanh toán và được giới thiệu bởi đối tác B được mời bởi đối tác A.
   * @returns Tổng doanh số.
   */
  async getSalesOfPartnerA(): Promise<number> {
    const paymentStatus = EFinancialStatus.paid;

    // Truy vấn tính tổng doanh số từ các đơn hàng được giới thiệu bởi đối tác A
    const queryA = this.orderRepository
      .createQueryBuilder('orders')
      .innerJoin('orders.user', 'user')
      .innerJoin('user.invitedBy', 'invitedBy')
      .select('SUM(orders.cashBackRef)', 'total')
      .where('invitedBy.role = :roleInvitedBy', {
        roleInvitedBy: EUserRole.partnerA,
      })
      .andWhere('orders.paymentStatus = :paymentStatus', { paymentStatus });

    const resultA = await queryA.getRawOne();
    const totalPriceA = resultA.total || 0;

    // Truy vấn tính tổng doanh số từ các đơn hàng được giới thiệu bởi đối tác B được mời bởi đối tác A
    const queryB = this.orderRepository
      .createQueryBuilder('orders')
      .innerJoin('orders.user', 'user')
      .innerJoin('user.invitedBy', 'invited')
      .innerJoin('invited.invitedBy', 'invitedByA')
      .select('SUM(orders.cashBackRefA)', 'total')
      .where(
        'invited.role = :roleInvitedBy AND invitedByA.role = :roleInvitedByA',
        {
          roleInvitedBy: EUserRole.partnerB,
          roleInvitedByA: EUserRole.partnerA,
        },
      )
      .andWhere('orders.paymentStatus = :paymentStatus', { paymentStatus });

    const resultB = await queryB.getRawOne();
    const totalPriceB = resultB.total || 0;

    return totalPriceA + totalPriceB;
  }

  /**
   * Lấy số lượng đơn hàng được giới thiệu bởi đối tác A và đối tác B được mời bởi đối tác A và đã thanh toán.
   * @returns Số lượng đơn hàng.
   */
  async getReferralCountOfPartnerA(): Promise<number> {
    const paymentStatus = EFinancialStatus.paid;

    // Truy vấn để đếm số lượng đơn hàng được giới thiệu bởi đối tác A và đối tác B được mời bởi đối tác A và đã thanh toán
    const query = this.orderRepository
      .createQueryBuilder('orders')
      .innerJoin('orders.user', 'user')
      .innerJoin('user.invitedBy', 'invited')
      .leftJoin('invited.invitedBy', 'invitedByA')
      .select('COUNT(orders.id)', 'total') // Đếm số lượng đơn hàng bằng cách đếm orders.id
      .andWhere(
        '(invited.role = :roleInvitedByA OR (invited.role = :roleInvited AND invitedByA.role = :roleInvitedByA))',
        {
          roleInvitedByA: EUserRole.partnerA,
          roleInvited: EUserRole.partnerB,
        },
      )
      .andWhere('orders.paymentStatus = :paymentStatus', { paymentStatus });

    const result = await query.getRawOne();
    const orderCount = result.total || 0;

    return orderCount;
  }

  /**
   * Lấy tổng doanh thu từ đơn hàng của theo EUserRole != partnerA đã thanh toán.
   * @returns Tổng doanh thu.
   */
  async getRevenueOfRoleDifferencePartnerA(role: EUserRole): Promise<number> {
    const paymentStatus = EFinancialStatus.paid;

    const query = this.orderRepository
      .createQueryBuilder('orders')
      .innerJoin('orders.user', 'user')
      .innerJoin('user.invitedBy', 'invitedBy')
      .select('SUM(orders.totalPrice)', 'total') // Tính tổng doanh thu bằng cách sử dụng SUM(orders.totalPrice)
      .andWhere('invitedBy.role = :role', { role })
      .andWhere('orders.paymentStatus = :paymentStatus', { paymentStatus });

    const result = await query.getRawOne();
    const revenue = result.total || 0;

    return revenue;
  }

  /**
   * Lấy tổng doanh số từ đơn hàng của theo EUserRole != partnerA đã thanh toán.
   * @returns Tổng doanh thu.
   */
  async getSalesOfRoleDifferencePartnerA(role: EUserRole): Promise<number> {
    const paymentStatus = EFinancialStatus.paid;

    const query = this.orderRepository
      .createQueryBuilder('orders')
      .innerJoin('orders.user', 'user')
      .innerJoin('user.invitedBy', 'invitedBy')
      .select('SUM(orders.cashBackRef)', 'total') // Tính tổng doanh số bằng cách sử dụng SUM(orders.cashBackRef)
      .andWhere('invitedBy.role = :role', { role })
      .andWhere('orders.paymentStatus = :paymentStatus', { paymentStatus });

    const result = await query.getRawOne();
    const revenue = result.total || 0;

    return revenue;
  }

  /**
   * Lấy số lượng đơn hàng được giới thiệu theo EUserRole != partnerA đã thanh toán.
   * @returns Số lượng đơn hàng.
   */
  async getReferralOfRoleDifferencePartnerA(role: EUserRole): Promise<number> {
    const paymentStatus = EFinancialStatus.paid;

    const query = this.orderRepository
      .createQueryBuilder('orders')
      .innerJoin('orders.user', 'user')
      .innerJoin('user.invitedBy', 'invitedBy')
      .select('COUNT(orders.id)', 'total') // Đếm số lượng đơn hàng bằng cách đếm orders.id
      .andWhere('invitedBy.role = :role', { role })
      .andWhere('orders.paymentStatus = :paymentStatus', { paymentStatus });

    const result = await query.getRawOne();
    const orderCount = result.total || 0;

    return orderCount;
  }
}
