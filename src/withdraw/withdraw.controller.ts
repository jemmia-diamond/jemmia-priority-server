import { Controller, Body, Request, Post, UseGuards, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequestPayload } from '../shared/types/controller.type';
import { UserService } from '../user/user.service';
import { WithdrawMoneyDto } from '../user/dto/with-draw.dto';
import { WithdrawService } from './withdraw.service';
import { EWithdrawStatus } from './dto/withdraw-status.dto';
import { BodyReqPaginDto } from './dto/pagin.dto';
import { EUserRole } from '../user/enums/user-role.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Withdraw')
@ApiBearerAuth()
@Controller('withdraw')
export class WithdrawController {
  constructor(
    private readonly userService: UserService,
    private readonly withdrawService: WithdrawService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('/request-withdraw-money')
  @ApiOperation({
    description: 'Tạo yêu cầu rút tiền.',
  })
  async withdrawMoney(
    @Request() req: RequestPayload,
    @Body() body: WithdrawMoneyDto,
  ) {
    const user = await this.userService.findUser(req.user.id);
    if (user.point > body.amount) {
      // cập nhật lại giá trị point của user.
      user.point -= body.amount;
      this.userService.updateNativeUser(user);

      // lưu trữ record withdraw vào database.
      return this.withdrawService.save({
        bankNumber: body.bankNumber,
        bankCode: body.bankCode,
        amount: body.amount,
        status: EWithdrawStatus.pending,
        user: user,
      });
    }
    return 'You do not have enough points to redeem.';
  }

  @Roles(EUserRole.admin)
  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({
    description: 'Lấy danh sách các yêu cầu rút tiền có phân trang',
  })
  async getAllWithdrawRequest(
    @Request() req: RequestPayload,
    @Body() body: BodyReqPaginDto,
  ) {
    return {
      requestWithdraws: await this.withdrawService.findAll(
        body.page,
        body.size,
      ),
      page: body.page,
      size: body.size,
      totalPage: Math.ceil(
        (await this.withdrawService.findAllAssetCount()) / body.size,
      ),
    };
  }
}
