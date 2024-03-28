import {
  Controller,
  Get,
  Param,
  UseGuards,
  Query,
  Request,
  Post,
  Body,
  Put,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  HaravanOrderDto,
  HaravanOrderSearchDto,
} from '../haravan/dto/haravan-order.dto';
import { RequestPayload } from '../types/controller.type';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CouponRefService } from '../coupon-ref/coupon-ref.service';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import {
  EPartnerCashbackConfig,
  EPartnerInviteCouponConfig,
} from '../coupon-ref/enums/partner-customer.enum';
import { Order } from './entities/order.entity';
import { EUserRole } from '../user/enums/user-role.enum';
import { paymentStatusEnum } from './enum/payment-status.dto';
import { v4 as uuid } from 'uuid';

@ApiTags('Order')
@ApiBearerAuth()
@Controller('order')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly couponRefService: CouponRefService,
    private readonly userService: UserService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(
    @Request() req: RequestPayload,
    @Query() query: HaravanOrderSearchDto,
  ) {
    return this.orderService.findAll(query, req.user.role, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Request() req: RequestPayload, @Param('id') id: number) {
    return this.orderService.findOne(+id, req.user.role, req.user.id);
  }

  @Post('/hook/haravan/create')
  async haravanHookCreate(
    @Request() req: RequestPayload,
    @Body() body: HaravanOrderDto,
  ) {
    try {
      // Xử lý xác thực token từ webhook.

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
        haravanOrderId: 123456,
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
      console.log(customerDto.id === guestId, customerDto.email === guestEmail);
      if (customerDto.id === guestId || customerDto.email === guestEmail) {
        console.log('Please Register New Account!');
        return 'Please Register New Account!';
      }
      if (customerDto.orders_count == 1 && discountCodes.length !== 0) {
        let couponRef = await this.couponRefService.findCouponCode(
          discountCodes[0].code,
        );
        if (couponRef !== null) {
          // NOTION-TASK:: Đơn đầu tiên của customer và nếu tồn tại CouponRef trong db thì::
          if (couponRef.type !== null) {
            console.log(customerDto.id);
            customerFound = await this.userService.findHaravanId(
              customerDto.id,
            );

            if (Object.keys(customerFound).length === 0) {
              customerFound = await this.userService.createNativeUser({
                haravanId: customerDto.id,
                authId: customerDto.email,
                phoneNumber: customerDto.phone,
              });
              console.log(customerFound);
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
          console.log('couponRef.ownerId::', couponRef.ownerId);
          console.log('customerFound.id', customerFound.id);
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

            console.log(couponRef);

            if (partnerCouponOwner.id == customerFound.id) {
              cashbackTo = couponOwner;
            } else {
              cashbackTo = null;
            }

            console.log('cashbackTo:: ', cashbackTo);

            if (cashbackTo != null) {
              console.log(
                '// JUST A FIXED VALUE, PLEASE TELL ME HOW TO GET THIS RANK ON cashbackto user (NhatsDevil).',
              );
              // JUST A FIXED VALUE, PLEASE TELL ME HOW TO GET THIS RANK ON cashbackto user (NhatsDevil).
              const exampleRankFixedBecauseIDontKnowHowToGetIt = 'platinum';

              let cashbackToPercent: number;
              let cashbackToValue: number;

              const cashBackCustomerOrderPercent =
                EPartnerCashbackConfig.firstBuyCashbackPercent.none.order;
              const cashBackCustomerOrderValue =
                orderDto.subtotal_price * cashBackCustomerOrderPercent;

              if (exampleRankFixedBecauseIDontKnowHowToGetIt === 'platinum') {
                cashbackToPercent =
                  EPartnerCashbackConfig.refferalCashbackPercent.platinum;
                cashbackToValue = orderDto.subtotal_price * cashbackToPercent;
              } else if (
                exampleRankFixedBecauseIDontKnowHowToGetIt === 'gold'
              ) {
                cashbackToPercent =
                  EPartnerCashbackConfig.refferalCashbackPercent.gold;
                cashbackToValue = orderDto.subtotal_price * cashbackToPercent;
              } else if (
                exampleRankFixedBecauseIDontKnowHowToGetIt === 'silver'
              ) {
                cashbackToPercent =
                  EPartnerCashbackConfig.refferalCashbackPercent.silver;
                cashbackToValue = orderDto.subtotal_price * cashbackToPercent;
              } else if (
                exampleRankFixedBecauseIDontKnowHowToGetIt === 'platinum'
              ) {
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

              // SET value of PROPs for customer.
              customerFound.accumulatedOrderPoint += cashBackCustomerOrderValue;
              customerFound.rankPoint += cashBackCustomerOrderValue;

              // UPDATE AND SAVE TO DATABASE.
              this.couponRefService.update(couponRef);

              this.userService.updateNativeUser(customerFound);
              this.userService.updateNativeUser(partnerCouponOwner);
              this.userService.updateNativeUser(cashbackTo);

              await this.orderService.createNative(orderCustomer);
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

  @Put('/hook/haravan')
  haravanHookUpdate(
    @Request() req: RequestPayload,
    @Body() body: HaravanOrderDto,
  ) {
    console.log('hook update');
    return this.orderService.haravanHook(body);
  }
}
