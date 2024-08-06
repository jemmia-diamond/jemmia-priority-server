import {
  Controller,
  Body,
  Request,
  Post,
  UseGuards,
  Get,
  Put,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequestPayload } from '../shared/types/controller.type';
import { UserService } from '../user/user.service';
import { WithdrawMoneyDto } from '../user/dto/with-draw.dto';
import { WithdrawService } from './withdraw.service';
import { EUserRole } from '../user/enums/user-role.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateWithDrawDto } from './dto/update-withdraw.dto';

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
    const user = await this.userService.findUserNative(req.user.id);

    if (!user) {
      throw new BadRequestException('Unknown User');
    }

    if (user.point > body.amount) {
      user.point -= Math.abs(body.amount);
      await this.userService.updateNativeUser(user);

      body.bankName = user.bankingAccount.bankName;
      body.bankNumber = user.bankingAccount.number;

      return this.withdrawService.save(body, user);
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
    @Query('page') page: number,
    @Query('size') size: number,
  ) {
    return this.withdrawService.findAll(page, size);
  }

  @Roles(EUserRole.admin)
  @UseGuards(JwtAuthGuard)
  @Put()
  @ApiOperation({
    description: 'Cập nhật trạng thái rút tiền.',
  })
  async updateStatusWithdraw(
    @Request() req: RequestPayload,
    @Body() body: UpdateWithDrawDto,
  ) {
    return this.withdrawService.checkandupdateStatus(body);
  }
}
