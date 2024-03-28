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
      let orderCustomer: Order;

      let customerFound: User = null;
      let partnerCouponOwner: User;

      //customerDto từ webhook trả về, nếu chúng có email hoặc id là guest thì trả về thông báo bắt tạo tài khoản.
      if (customerDto.id === guestId || customerDto.email === guestEmail) {
        return 'Please Register New Account!';
      }

      //customerDto có mua hàng lần đầu tiên và có dùng mã giảm giá nào không.
      if (customerDto.orders_count === 1 && discountCodes.length !== 0) {
        let couponRef = await this.couponRefService.findCouponCode(
          discountCodes[0].code,
        );

        if (couponRef !== null) {
          // NOTION-TASK:: Đơn đầu tiên của customer và nếu tồn tại CouponRef trong db thì::
          if (couponRef.type !== null) {
            customerFound = await this.userService.findHaravanId(
              customerDto.id,
            );

            customerFound.rankPoint =
              EPartnerInviteCouponConfig[couponRef.type].receiveRankPoint;

            couponRef = await this.couponRefService.convertPartnerToInvite(
              customerFound.id,
              couponRef.couponHaravanCode,
            );
          }
          // NOTION-TASK:: Kiểm tra phân hạng và cash back về cho chủ coupon thì::
          if (
            couponRef.partnerCoupon.owner != null &&
            couponRef.owner.id != customerFound.id
          ) {
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

              partnerCouponOwner = couponRef.partnerCoupon.owner;
              partnerCouponOwner.accumulatedOrderPoint += cashBackValue;
              partnerCouponOwner.rankPoint += cashBackValue;
            } else {
              return 'Please update financial_status of your order!';
            }

            // Kiểm tra cashbackTo tồn tại
            let cashbackTo: null | User;
            if (couponRef.owner.id == customerFound.id) {
              if (couponRef.partnerCoupon.owner) {
                cashbackTo = couponRef.owner;
              } else {
                cashbackTo = null;
              }
            } else {
              cashbackTo = null;
            }

            if (cashbackTo != null) {
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
              orderCustomer.id = orderDto.id;
              orderCustomer.totalPrice = orderDto.total_price;
              orderCustomer.cashBackRef += cashbackToValue;
              orderCustomer.cashBack += cashBackCustomerOrderValue;

              // SET value of PROPs for customer.
              customerFound.accumulatedOrderPoint += cashBackCustomerOrderValue;
              customerFound.rankPoint += cashBackCustomerOrderValue;

              // UPDATE AND SAVE TO DATABASE.
              this.couponRefService.update(couponRef);

              this.userService.updateNativeUser(customerFound);
              this.userService.updateNativeUser(partnerCouponOwner);
              this.userService.updateNativeUser(cashbackTo);

              this.orderService.createNative(orderCustomer);
            }
          }
        }
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
