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
      user: {
        id: user.id,
      },
      status: EWithdrawStatus.pending,
    });

    await this.notificationRepository.save({
      title: 'Rút tiền',
      receiver: {
        id: user.id,
      },
      description: `Yêu cầu rút <b>${data.amount.toLocaleString('vi')}đ</b> đang được xử lý`,
    });
    return data;
  }

  async findAll(ownerId: string, page: number, size: number) {
    const requestWithdraws = await this.withdrawRepostitory.find({
      where: {
        user: {
          id: ownerId,
        },
      },
      skip: (page - 1) * size,
      take: size,
      order: {
        createdDate: 'DESC',
      },
      relations: {
        user: true,
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
    const withdrawFound = await this.withdrawRepostitory.findOne({
      where: {
        id: withdrawDto.id,
      },
      relations: {
        user: true,
      },
    });
    if (withdrawFound) {
      withdrawFound.status = withdrawDto.status;

      await this.notificationRepository.save({
        title: 'Rút tiền',
        receiver: {
          id: withdrawFound.user.id,
        },
        description: `Yêu cầu rút <b>${withdrawFound.amount.toLocaleString('vi')}đ</b> đã được xử lý`,
        type: NotificationType.cashback,
      });

      return await this.withdrawRepostitory.save(withdrawFound);
    }

    return;
  }
}
