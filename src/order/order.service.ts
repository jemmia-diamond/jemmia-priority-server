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
import { CustomerRankService } from '../customer-rank/customer-rank.service';

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
    private readonly customerRankService: CustomerRankService,
    private readonly userService: UserService,
  ) {}

  async findAll(query: OrderQueryDto) {
    const limit = query.limit || 1;
    const page = (query.page ?? 0) - 1;
    const offset = page * limit;
    const [items, totalItems] = await this.orderRepository.findAndCount({
      where: [
        {
          user: {
            id: query.userId,
          },
        },
        {
          couponRef: [
            {
              owner: [
                {
                  id: query.userId,
                },
                {
                  invitedBy: {
                    id: query.userId,
                  },
                },
              ],
            },
          ],
        },
      ],
      order: { createdDate: 'DESC' },
      skip: offset,
      take: limit,
      relations: ['user', 'couponRef.owner.invitedBy'],
      select: {
        user: {
          id: true,
        },
        couponRef: {
          id: true,
          owner: {
            id: true,
            invitedBy: {
              id: true,
            },
          },
        },
      },
    });

    const itemsFormmated = items.map((i) => ({
      ...i,
      point:
        query.userId === i.user.id
          ? i.cashBack
          : query.userId === i.couponRef.owner.id
            ? i.cashBackRef
            : i.cashBackRefA,
    }));

    return new Pagination<Order>(itemsFormmated, {
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

    //Tính cashback cho partner A
    if (couponRef.owner?.invitedBy?.role === EUserRole.partnerA) {
      console.log('CALC CASHBACK A');
      cashBackRefA +=
        totalPrice *
        EPartnerCashbackConfig.partnerRefferalCashbackPercent.partnerA.partnerB;
    }

    //Lấy ra người đã mời khách hàng
    const inviter = couponRef.owner;
    // couponRef.owner.id === order.user.id //Trường hợp chủ couponRef cũng là người mua hàng
    //   ? couponRef.owner.invitedBy //Trả về cho người đã mời trước đó
    //   : couponRef.owner;

    console.log('========== INVITER');
    console.log(JSON.stringify(inviter));

    //Tính cashback theo rank thông thường
    if (
      inviter?.id !== order.user.id && //Không tự mời chính mình
      couponRef.type === ECouponRefType.invite //Chỉ cashback cho couponRefType === invite
    ) {
      const cashbackPercent =
        EPartnerCashbackConfig.refferalCashbackPercent[
          ECustomerRankNum[inviter.rank]
        ] || 0;

      cashBackRef = totalPrice * cashbackPercent;
    }

    // cashBack = totalPrice * EPartnerCashbackConfig.firstBuyCashbackPercent;
    cashBack = 0; //*Set = 0 Vì đã được giảm thẳng khi mua hàng

    console.log({
      cashBack: cashBack || 0,
      cashBackRef: cashBackRef || 0,
      cashBackRefA: cashBackRefA || 0,
    });

    return {
      cashBack: cashBack || 0,
      cashBackRef: cashBackRef || 0,
      cashBackRefA: cashBackRefA || 0,
      /** Người mời được nhận cashbackRef */
      inviter: inviter,
    };
  }

  async haravanHook(orderDto: HaravanOrderDto) {
    try {
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

      let couponRef: CouponRef;
      if (orderDto.discount_codes.length) {
        couponRef = await this.couponRefRepository.findOne({
          where: {
            couponHaravanCode: orderDto.discount_codes[0]?.code,
          },
          relations: ['owner.invitedBy'],
        });
        console.log('\n========== COUPON REF/');
        console.log(JSON.stringify(couponRef));
      }

      //Tạo khách hàng nếu không tồn tại
      if (!customer) {
        console.log('\n========== CUSTOMER');
        console.log(JSON.stringify(customer));

        customer = await this.userService.createUserFromHaravan(
          orderDto.customer,
        );
      }

      if (!order) {
        console.log('\n========== ORDER');
        console.log(JSON.stringify(order));

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
        //Mặc định sẽ set luôn đã sử dụng khi tạo đơn vì khi huỷ đơn thì coupon cũng k thể sử dụng lại
        couponRef.used = true;

        //Gắn couponRef owner vào user ở trường hợp A cầm coupon ref đi mua hàng
        if (!couponRef.owner) {
          couponRef.owner = customer;
        }

        order.couponRef = couponRef;
      }
      order.user = customer;

      //Nếu đơn huỷ
      if (orderDto.cancelled_status == 'cancelled') {
        order.paymentStatus = EFinancialStatus.cancelled;
      }

      //Xử lý cho lần đầu mua hàng
      if (
        orderDto.customer.ordersCount === 1 ||
        orderDto.customer.totalSpent === 0
      ) {
        //Chỉ tính refferral khi mua hàng có giới thiệu
        if (couponRef) {
          const cashbackVal = await this.calculateCashback(order);

          order.cashBack = cashbackVal.cashBack;
          order.cashBackRef = cashbackVal.cashBackRef;
          order.cashBackRefA = cashbackVal.cashBackRefA;
        }

        //Chỉ khi đã thanh toán
        if (order.paymentStatus == EFinancialStatus.paid) {
          //*Nếu đơn có sử dụng mã mời
          if (couponRef) {
            couponRef.used = true;

            //Set thăng hạng cho partner khi mua hàng lần đầu nếu sử dụng couponRef Partner
            //Xử lý khi partner đi mua hàng lần đầu
            if (couponRef.type == ECouponRefType.partner) {
              customer.rank =
                EPartnerInviteCouponConfig[couponRef.role]?.receiveRank ||
                customer.rank;

              customer.role = couponRef.role;

              //Convert coupon ref
              // await this.couponRefService.convertPartnerToInvite(
              //   customer.id,
              //   couponRef.couponHaravanCode,
              // );
            } else {
              //*Là couponref khách hàng invite thông thường

              //Cashback cho partner A
              if (
                couponRef.owner.invitedBy?.role === EUserRole.partnerA &&
                couponRef.owner.role === EUserRole.partnerB
              ) {
                couponRef.owner.invitedBy.point += order.cashBackRefA;
                await this.userRepository.save(couponRef.owner.invitedBy);
              }

              //Cashback thông thường theo rank
              couponRef.owner.point += order.cashBackRef;

              //Set người đã mời khách hàng
              customer.invitedBy = couponRef.owner;

              await this.userRepository.save(couponRef.owner);
            }

            //Set người đã mời khách hàng
            if (customer.id !== couponRef.owner.id) {
              customer.invitedBy = couponRef.owner;

              //Cập nhật số lượng user đã mời cho chủ coupon;
              couponRef.owner.invitesCount++;
              await this.userRepository.save(couponRef.owner);
            }
          }

          //Cashback cho người mua
          customer.point += order.cashBack;
          //Cộng giá trị đơn tích luỹ
          customer.accumulatedOrderPoint += order.totalPrice;
        }

        if (couponRef) {
          await this.couponRefRepository.save(couponRef);
        }
      }

      //Cập nhật rank
      if (order.paymentStatus == EFinancialStatus.paid) {
        if (couponRef?.owner) {
          //Cập nhật rank cho inviter
          couponRef.owner.rank =
            await this.customerRankService.calculateUserRank(couponRef.owner);

          await this.userRepository.save(couponRef.owner);

          if (couponRef.owner.invitedBy) {
            //Cập nhật rank cho partnerA
            couponRef.owner.invitedBy.rank =
              await this.customerRankService.calculateUserRank(
                couponRef.owner.invitedBy,
              );

            await this.userRepository.save(couponRef.owner.invitedBy);
          }
        }

        //Cập nhật rank cho customer
        customer.rank =
          await this.customerRankService.calculateUserRank(customer);
      }

      await this.orderRepository.save(order);
      await this.userRepository.save(customer);

      console.log('============ RETURN');
    } catch (e) {
      console.log(e);
      return;
    }
  }
}
