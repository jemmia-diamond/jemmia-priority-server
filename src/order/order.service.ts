import { Injectable } from '@nestjs/common';
import {
  HaravanOrderDto,
  HaravanOrderSearchDto,
} from '../haravan/dto/haravan-order.dto';
import { HaravanService } from '../haravan/haravan.service';
import { EUserRole } from '../user/enums/user-role.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { paymentStatusEnum } from './enum/payment-status.dto';
import { CouponRefService } from '../coupon-ref/coupon-ref.service';
import { UserService } from '../user/user.service';
import {
  EPartnerCashbackConfig,
  EPartnerInviteCouponConfig,
} from '../coupon-ref/enums/partner-customer.enum';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    private readonly haravanService: HaravanService,
    private readonly couponRefService: CouponRefService,
    private readonly userService: UserService,
  ) {}

  async findAll(query: HaravanOrderSearchDto, role: string, userId: string) {
    try {
      if (role != EUserRole.admin) {
        const user = await this.userRepository.findOneBy({ id: userId });
        query.customer.id = user.haravanId;
      }
      return {
        orders: await this.haravanService.findAllOrder(query),
      };
    } catch (error) {
      return error;
    }
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

  async haravanHook(body: HaravanOrderDto) {
    try {
      //Khởi tạo biến dùng để dễ theo dõi giá trị biến trong xuyên suốt hàm.
      const guestId = 1117709100;
      const guestEmail = 'guest@haravan.com';
      const financialStatus = 'paid';

      const orderDto = body;
      const customerDto = body.customer;
      const discountCodes = body.discount_codes;

      let couponOwner: User;

      let customerFound: User;
      let partnerCouponOwner: User;

      let orderCustomer: Order = {
        id: null,
        haravanOrderId: null,
        cashBack: 0,
        cashBackRef: 0,
        cashBackRefA: 0,
        totalPrice: 0,
        paymentStatus: paymentStatusEnum.PENDING,
        user: null,
        couponRef: null,
        createdDate: null,
      };

      //customerDto từ webhook trả về, nếu chúng có email hoặc id là guest thì trả về thông báo bắt tạo tài khoản.
      if (customerDto.id === guestId || customerDto.email === guestEmail) {
        return 'Please Register New Account!';
      }
      if (customerDto.orders_count == 1 && discountCodes.length !== 0) {
        let couponRef = await this.couponRefService.findCouponCode(
          discountCodes[0].code,
        );
        if (couponRef !== null) {
          // NOTION-TASK:: Đơn đầu tiên của customer và nếu tồn tại CouponRef trong db thì::
          if (couponRef.type !== null) {
            customerFound = await this.userService.findHaravanId(
              customerDto.id,
            );

            if (Object.keys(customerFound).length === 0) {
              customerFound = await this.userService.createNativeUser({
                rank: 0,
                haravanId: customerDto.id,
                authId: customerDto.email,
                phoneNumber: customerDto.phone,
              });
            }

            customerFound.rankPoint =
              EPartnerInviteCouponConfig[couponRef.role].receiveRankPoint;

            couponOwner = await this.userService.findUserNative(
              couponRef.ownerId,
            );

            couponRef = await this.couponRefService.convertPartnerToInvite(
              couponRef.ownerId,
              couponRef.couponHaravanCode,
            );
          }
          // NOTION-TASK:: Kiểm tra phân hạng và cash back về cho chủ coupon thì::
          if (couponRef.ownerId != customerFound.id) {
            // kiểm tra rằng orderDto từ webhook đã thanh toán chưa.
            if (orderDto.financial_status === financialStatus) {
              const cashBackPercentAandB =
                EPartnerCashbackConfig.partnerRefferalCashbackPercent[
                  EUserRole.partnerA
                ][EUserRole.partnerB];
              const cashBackValue =
                orderDto.subtotal_price * cashBackPercentAandB;

              orderCustomer.cashBack += cashBackValue;

              orderCustomer.cashBackRefA += cashBackValue;

              partnerCouponOwner = await this.userService.findUserNative(
                customerFound.id,
              );

              partnerCouponOwner.accumulatedOrderPoint += cashBackValue;
              partnerCouponOwner.rankPoint += cashBackValue;
            } else {
              return 'Please update financial_status of your order!';
            }

            // Kiểm tra cashbackTo tồn tại
            let cashbackTo: null | User;

            if (partnerCouponOwner.id == customerFound.id) {
              cashbackTo = couponOwner;
            } else {
              cashbackTo = null;
            }

            if (cashbackTo != null) {
              // JUST A FIXED VALUE, PLEASE TELL ME HOW TO GET THIS RANK ON cashbackto user (NhatsDevil).

              let cashbackToPercent: number;
              let cashbackToValue: number;

              const cashBackCustomerOrderPercent =
                EPartnerCashbackConfig.firstBuyCashbackPercent.none.order;
              const cashBackCustomerOrderValue =
                orderDto.subtotal_price * cashBackCustomerOrderPercent;

              if (cashbackTo.rank == 4) {
                cashbackToPercent =
                  EPartnerCashbackConfig.refferalCashbackPercent.platinum;
                cashbackToValue = orderDto.subtotal_price * cashbackToPercent;
              } else if (cashbackTo.rank == 3) {
                cashbackToPercent =
                  EPartnerCashbackConfig.refferalCashbackPercent.gold;
                cashbackToValue = orderDto.subtotal_price * cashbackToPercent;
              } else if (cashbackTo.rank == 2) {
                cashbackToPercent =
                  EPartnerCashbackConfig.refferalCashbackPercent.silver;
                cashbackToValue = orderDto.subtotal_price * cashbackToPercent;
              } else if (cashbackTo.rank == 1) {
                cashbackToPercent =
                  EPartnerCashbackConfig.refferalCashbackPercent.staff;
                cashbackToValue = orderDto.subtotal_price * cashbackToPercent;
              } else {
                // HANDLE ARISE CASE IN THE FUTURE.
              }

              // SET value of PROPs for CashBackTo.
              cashbackTo.accumulatedOrderPoint += cashbackToValue;
              cashbackTo.rankPoint += cashbackToValue;

              // SET value of PROPs for orderCustomer.
              orderCustomer.id = uuid();
              orderCustomer.totalPrice = orderDto.total_price;
              orderCustomer.cashBackRef += cashbackToValue;
              orderCustomer.cashBack += cashBackCustomerOrderValue;
              orderCustomer.user = partnerCouponOwner;
              orderCustomer.couponRef = couponRef;
              orderCustomer.haravanOrderId = orderDto.id;

              // SET value of PROPs for customer.
              customerFound.accumulatedOrderPoint += cashBackCustomerOrderValue;
              customerFound.rankPoint += cashBackCustomerOrderValue;

              // UPDATE AND SAVE TO DATABASE.
              this.couponRefService.update(couponRef);

              this.userService.updateNativeUser(customerFound);
              this.userService.updateNativeUser(partnerCouponOwner);
              this.userService.updateNativeUser(cashbackTo);

              await this.createNative(orderCustomer);
            }
          }
        }
        console.log(body);
        return orderCustomer;
      } else {
        // Retension CASE.
        return 'Retension (Quay lại) NOTE: TẠM THỜI SKIP ĐỢI MEETING SẮP TỚI ';
      }
    } catch (e) {
      console.log(e);
    }
  }
}
function uuid(): string {
  throw new Error('Function not implemented.');
}
