import { Injectable } from '@nestjs/common';
import {
  EFinancialStatus,
  HaravanOrderDto,
  HaravanOrderSearchDto,
} from '../haravan/dto/haravan-order.dto';
import { HaravanService } from '../haravan/haravan.service';
import { EUserRole } from '../user/enums/user-role.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { CouponRefService } from '../coupon-ref/coupon-ref.service';
import { UserService } from '../user/user.service';
import {
  EPartnerCashbackConfig,
  EPartnerInviteCouponConfig,
} from '../coupon-ref/enums/partner-customer.enum';
import { plainToInstance } from 'class-transformer';
import { CouponRef } from '../coupon-ref/entities/coupon-ref.entity';
import { ECustomerRankNum } from '../customer-rank/enums/customer-rank.enum';
import { ECouponRefType } from '../coupon-ref/enums/coupon-ref.enum';
import { OrderQueryDto } from './dto/order-query.dto';
import { Pagination } from 'nestjs-typeorm-paginate';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(CouponRef)
    private couponRefRepository: Repository<CouponRef>,
    private readonly haravanService: HaravanService,
    private readonly couponRefService: CouponRefService,
    private readonly userService: UserService,
  ) {}

  async findAll(query: OrderQueryDto) {
    const limit = query.limit || 1;
    const page = (query.page ?? 0) - 1;
    const offset = page * limit;
    const [items, totalItems] = await this.orderRepository.findAndCount({
      where: {
        user: {
          id: query.userId,
        },
      },
      order: { createdDate: 'DESC' },
      skip: offset,
      take: limit,
    });

    return new Pagination<Order>(items, {
      itemCount: items.length,
      itemsPerPage: limit,
      totalPages: Math.ceil(totalItems / limit),
      totalItems,
      currentPage: page,
    });
  }

  async findOne(id: number, role: string, userId: string) {
    try {
      const query = new HaravanOrderSearchDto();
      if (role != EUserRole.admin) {
        const user = await this.userRepository.findOneBy({ id: userId });
        query.customer.id = user.haravanId;
      }
      return await this.haravanService.findOneOrder(query, id);
    } catch (error) {
      return error;
    }
  }

  async createNative(order: Order) {
    return await this.orderRepository.save(order);
  }

  async calculateCashback(order: Order) {
    console.log('========== CALC CASHBACK ==========');
    const couponRef = order.couponRef;
    let cashBack = 0,
      cashBackRef = 0,
      cashBackRefA = 0;

    if (!couponRef) {
      return {
        cashBack,
        cashBackRef,
        cashBackRefA,
      };
    }

    console.log(JSON.stringify(couponRef));

    const totalPrice = order.totalPrice;

    console.log(totalPrice);

    //Tính cashback: 1.5% dựa trên đơn hàng cho partner A
    if (couponRef.partnerCoupon?.owner && couponRef.owner != order.user) {
      cashBackRefA +=
        totalPrice *
        EPartnerCashbackConfig.partnerRefferalCashbackPercent.partnerA.partnerB;
    }

    //Cashback cho người mời khách hàng
    const cashBackToInviter =
      couponRef.owner.id === order.user.id
        ? couponRef.partnerCoupon.owner //Trường hợp khách hàng là đối tác hạng B thì cashback cho partnerA
        : couponRef.owner; // Trường hợp khách hàng thông thường thì cashback cho partnerB

    console.log('========== INVITER');
    console.log(JSON.stringify(cashBackToInviter));

    if (cashBackToInviter) {
      const cashbackPercent =
        EPartnerCashbackConfig.refferalCashbackPercent[
          ECustomerRankNum[cashBackToInviter.rank]
        ] || 0;

      cashBackRef = totalPrice * cashbackPercent;
    }

    cashBack =
      totalPrice * EPartnerCashbackConfig.firstBuyCashbackPercent.none.order;

    console.log(cashBack, cashBackRef, cashBackRefA);

    return {
      cashBack: cashBack || 0,
      cashBackRef: cashBackRef || 0,
      cashBackRefA: cashBackRefA || 0,
      /** Người mời được nhận cashbackRef */
      inviter: cashBackToInviter,
    };
  }

  async haravanHook(orderDto: HaravanOrderDto) {
    orderDto = plainToInstance(HaravanOrderDto, orderDto);

    //!Chỉ xử lý các đơn có khách hàng được gán
    if (!orderDto.customer?.id) {
      return 'CANT FIND CUSTOMER';
    }

    //Get Order
    let order = await this.orderRepository.findOne({
      where: {
        haravanOrderId: orderDto.id,
      },
      relations: ['user', 'couponRef'],
    });

    let customer = await this.userRepository.findOneBy({
      haravanId: orderDto.customer.id,
    });
    const couponRef = await this.couponRefRepository.findOne({
      where: {
        couponHaravanCode: orderDto.discount_codes[0]?.code,
      },
      relations: ['owner', 'partnerCoupon', 'partnerCoupon.owner'],
    });

    //Tạo khách hàng nếu không tồn tại
    if (!customer) {
      customer = await this.userService.createUserFromHaravan(
        orderDto.customer,
      );
    }

    if (!order) {
      order = await this.orderRepository.save({
        haravanOrderId: orderDto.id,
        totalPrice: orderDto.total_price,
        paymentStatus: orderDto.financial_status,
        customer,
      });
    }

    order.paymentStatus = orderDto.financial_status;
    order.totalPrice = orderDto.total_price;

    if (couponRef) {
      order.couponRef = couponRef;
    }
    order.user = customer;

    //Xử lý cashback cho lần đầu mua hàng
    if (orderDto.customer.totalSpent === 0) {
      const cashbackVal = await this.calculateCashback(order);

      order.cashBack = cashbackVal.cashBack;
      order.cashBackRef = cashbackVal.cashBackRef;
      order.cashBackRefA = cashbackVal.cashBackRefA;

      //Chỉ khi đã thanh toán
      if (order.paymentStatus == EFinancialStatus.paid) {
        //Set thăng hạng cho partner khi mua hàng lần đầu nếu sử dụng couponRef Partner
        if (couponRef.type == ECouponRefType.partner) {
          customer.rank =
            EPartnerInviteCouponConfig[couponRef.role]?.receiveRank ||
            customer.rank;

          customer.role = couponRef.role;

          //Convert coupon ref
          await this.couponRefService.convertPartnerToInvite(
            customer.id,
            couponRef.couponHaravanCode,
          );
        }

        //Cashback cho partner A
        if (couponRef.partnerCoupon) {
          couponRef.partnerCoupon.owner.point += cashbackVal.cashBackRefA;

          await this.userRepository.save(couponRef.partnerCoupon.owner);
        }

        //Cashback cho inviter
        if (cashbackVal.inviter) {
          cashbackVal.inviter.point += cashbackVal.cashBackRef;

          await this.userRepository.save(cashbackVal.inviter);
        }

        //Cashback cho người mua
        customer.point += cashbackVal.cashBack;

        //Cộng giá trị đơn tích luỹ
        customer.accumulatedOrderPoint += order.totalPrice;
      }

      await this.orderRepository.save(order);
      await this.userRepository.save(customer);
    }
  }
}
