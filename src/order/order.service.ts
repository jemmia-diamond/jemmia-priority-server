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
import { In, MoreThan, Repository } from 'typeorm';
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
import { Notification } from '../notification/entities/notification.entity';
import { NotificationType } from '../notification/enums/noti-type.enum';
import { CrmService } from '../crm/crm.service';
import { createHmac } from 'crypto';
import { EPaymentAffiliateCommission } from './enum/order-type.enum';
import { PaymentType } from '../haravan/enums/payment-type.enum';
import { PAYMENT_COMMISSION } from './constants/payment-commision';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(CouponRef)
    private couponRefRepository: Repository<CouponRef>,
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    private readonly haravanService: HaravanService,
    private readonly crmService: CrmService,
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
              owner: {
                id: query.userId,
              },
            },
            {
              owner: {
                invitedBy: {
                  id: query.userId,
                },
              },
            },
          ],
        },
      ],
      order: { createdDate: 'DESC' },
      skip: offset,
      take: limit,
      relations: {
        user: true,
        couponRef: {
          owner: {
            invitedBy: true,
          },
        },
      },
      select: {
        user: {
          id: true,
        },
        couponRef: {
          id: true,
          couponHaravanCode: true,
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

  calculateCashbackForAffiliate = (order: Order) => {
    if (order.paymentType === PaymentType.POS) {
      return order.totalPrice * EPaymentAffiliateCommission.POS;
    }
    return order.totalPrice * PAYMENT_COMMISSION.NOT_POS;
  };

  verifyHaravanHook(data: any, headerSignature: string) {
    const hmac = createHmac('sha256', process.env.HARAVAN_SECRET);
    const hmacData = hmac.update(Buffer.from(JSON.stringify(data), 'utf8'));
    const signature = hmacData.digest('base64');

    return signature === headerSignature;
  }

  async haravanHook(orderDto: HaravanOrderDto) {
    //!Xử lý check hook data
    try {
      orderDto = plainToInstance(HaravanOrderDto, orderDto);

      //!Chỉ xử lý các đơn có khách hàng được gán
      if (!orderDto.customer?.id) {
        return 'CANT FIND CUSTOMER';
      }

      //Get Order dựa trên haravanId hoặc coupon-ref (Dùng cho trường hợp coupon-ref không giới hạn)
      let order = await this.orderRepository.findOne({
        where: [
          {
            haravanOrderId: orderDto.id,
          },
          {
            couponRef: {
              used: false,
              couponHaravanCode: orderDto.discount_codes?.length
                ? In(orderDto.discount_codes.map((d) => d.code))
                : null,
            },
          },
        ],
        relations: {
          user: true,
          couponRef: true,
        },
      });

      //Sync latest order
      let customer = await this.userRepository.findOneBy({
        haravanId: orderDto.customer.id,
      });

      //Kiểm tra coupon được sử dụng
      let couponRef: CouponRef;
      if (orderDto.discount_codes.length) {
        couponRef = await this.couponRefRepository.findOne({
          where: {
            couponHaravanCode: In(orderDto.discount_codes.map((d) => d.code)),
          },
          relations: {
            owner: {
              invitedBy: true,
            },
          },
        });
      }

      //Tạo khách hàng nếu không tồn tại
      if (!customer) {
        console.log('\n========== CUSTOMER');

        customer = await this.userService.createUserFromHaravan(
          orderDto.customer,
        );
        console.log(JSON.stringify(customer));
      }

      if (!order) {
        const paymentType = await this.haravanService.getPaymentType(
          orderDto.id,
          customer.role,
        );

        order = await this.orderRepository.save({
          haravanOrderId: orderDto.id,
          totalPrice: orderDto.total_price,
          paymentStatus: orderDto.financial_status,
          customer,
          paymentType,
        });
      }

      order.paymentStatus = orderDto.financial_status;
      order.totalPrice = orderDto.total_price;

      //Cập nhật owner của coupon-ref & gắn vào order
      if (couponRef) {
        //Gắn couponRef owner vào user ở trường hợp A cầm coupon ref đi mua hàng
        if (!couponRef.owner) {
          couponRef.owner = customer;
        }

        order.couponRef = couponRef;

        //Cập nhật người sử dụng coupon-ref
        if (
          order.paymentStatus == EFinancialStatus.pending ||
          order.paymentStatus == EFinancialStatus.cancelled //Trường hợp đơn đang được huỷ -> User đặt lại
        ) {
          couponRef.usedCount++;
          couponRef.usedBy = customer;
          couponRef.usedByName = `${orderDto.customer.firstName || ''} ${orderDto.customer.lastName || ''}`;
        }
      }
      order.user = customer;

      //Nếu đơn huỷ
      if (orderDto.cancelled_status == 'cancelled') {
        order.paymentStatus = EFinancialStatus.cancelled;
      }

      //Xử lý cho lần đầu mua hàng
      if (!customer.isFirstOrder) {
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
          if (couponRef && !couponRef.used) {
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

          //Check the role of customer, if the role is affiliate, then calculate cashback for affiliate
          if (customer.role === EUserRole.affiliate) {
            order.cashBack += this.calculateCashbackForAffiliate(order);
          }

          //Cashback for buyer
          customer.point += order.cashBack;

          //Mark have first order
          customer.isFirstOrder = true;

          //Thông báo cho inviter
          const noti = new Notification();
          noti.title = `${orderDto.customer.firstName || ''} ${orderDto.customer.lastName || ''} đã mua hàng từ mã giới thiệu của bạn.`;
          noti.receiver = couponRef.owner;
          noti.type = NotificationType.ref;
          noti.description = `Bạn vừa nhận ${order.cashBackRef?.toLocaleString('vi')} Points từ ${couponRef.couponHaravanCode}`;

          await this.notificationRepository.save(noti);
        }

        if (couponRef) {
          await this.couponRefRepository.save(couponRef);
        }
      }

      if (order.paymentStatus === EFinancialStatus.paid) {
        // customer.accumulatedOrderPoint += order.totalPrice;
      }

      await this.orderRepository.save(order);
      await this.userRepository.save(customer);

      //Update the rank
      if (order.paymentStatus === EFinancialStatus.paid) {
        if (couponRef?.owner) {
          console.log('====== U COUPON REF OWNER RANK');
          //Cập nhật rank cho inviter
          await this.customerRankService.updateUserRank(couponRef.owner);

          if (couponRef.owner.invitedBy) {
            console.log('====== U COUOPON REF TOKEN RANK');
            //Cập nhật rank cho partnerA
            await this.customerRankService.updateUserRank(
              couponRef.owner.invitedBy,
            );
          }
        }

        console.log('====== U CUSTOMER RANK');
        console.log(JSON.stringify(customer));
        //Cập nhật rank cho customer
        await this.customerRankService.updateUserRank(customer);
      }

      console.log('============ RETURN');
    } catch (e) {
      console.log(e);
      return;
    }
  }
}
