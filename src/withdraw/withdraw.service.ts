import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Withdraw } from './entities/withdraw.entity';
import { WithdrawMoneyDto } from '../user/dto/with-draw.dto';
import { User } from '../user/entities/user.entity';
import { EWithdrawStatus } from './dto/withdraw-status.dto';
import { UpdateWithDrawDto } from './dto/update-withdraw.dto';
import { Notification } from '../notification/entities/notification.entity';
import { NotificationType } from '../notification/enums/noti-type.enum';

@Injectable()
export class WithdrawService {
  constructor(
    @InjectRepository(Withdraw)
    private withdrawRepostitory: Repository<Withdraw>,
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async findById(id: string) {
    const user = await this.withdrawRepostitory.findOneBy({
      id: id,
    });
    return user;
  }

  async save(withdraw: WithdrawMoneyDto, user: User) {
    const data = await this.withdrawRepostitory.save({
      bankName: withdraw.bankName,
      bankNumber: withdraw.bankNumber,
      amount: withdraw.amount,
      user: user,
      status: EWithdrawStatus.pending,
    });

    const noti = new Notification();
    noti.title = 'Rút tiền';
    noti.receiver = user;
    noti.type = NotificationType.cashback;
    noti.description = `Yêu cầu rút <b>${data.amount.toLocaleString('vi')}đ</b> đang được xử lý`;

    await this.notificationRepository.save(noti);
    return data;
  }

  async findAll(page: number, size: number) {
    const requestWithdraws = await this.withdrawRepostitory.find({
      skip: (page - 1) * size,
      take: size,
      order: {
        createdDate: 'DESC',
      },
    });
    return {
      requestWithdraws,
      page,
      size,
      totalPage: Math.ceil((await this.withdrawRepostitory.count()) / size),
    };
  }

  async checkandupdateStatus(withdrawDto: UpdateWithDrawDto) {
    const withdrawFound = await this.withdrawRepostitory.findOneBy({
      id: withdrawDto.id,
    });
    if (withdrawFound) {
      withdrawFound.status = withdrawDto.status;

      const noti = new Notification();
      noti.title = 'Rút tiền';
      noti.receiver = withdrawFound.user;
      noti.type = NotificationType.cashback;
      noti.description = `Yêu cầu rút <b>${withdrawFound.amount.toLocaleString('vi')}đ</b> đã được xử lý`;

      await this.notificationRepository.save(noti);

      return await this.withdrawRepostitory.save(withdrawFound);
    }

    return;
  }
}
