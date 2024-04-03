import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Withdraw } from './entities/withdraw.entity';
import { WithdrawMoneyDto } from '../user/dto/with-draw.dto';
import { User } from '../user/entities/user.entity';
import { EWithdrawStatus } from './dto/withdraw-status.dto';
import { UpdateWithDrawDto } from './dto/update-withdraw.dto';

@Injectable()
export class WithdrawService {
  constructor(
    @InjectRepository(Withdraw)
    private withdrawRepostitory: Repository<Withdraw>,
  ) {}

  async findById(id: string) {
    const user = await this.withdrawRepostitory.findOneBy({
      id: id,
    });
    return user;
  }

  async save(withdraw: WithdrawMoneyDto, user: User) {
    return await this.withdrawRepostitory.save({
      bankName: withdraw.bankName,
      bankNumber: withdraw.bankNumber,
      amount: withdraw.amount,
      user: user,
      status: EWithdrawStatus.pending,
    });
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
      totalPage: (await this.withdrawRepostitory.count()) / size,
    };
  }

  async checkandupdateStatus(withdrawDto: UpdateWithDrawDto) {
    const withdrawFound = await this.withdrawRepostitory.findOneBy({
      id: withdrawDto.withdrawRequestId,
      user: {
        id: withdrawDto.userId,
      },
    });
    if (withdrawFound) {
      withdrawFound.status = withdrawDto.status;
      return await this.withdrawRepostitory.save(withdrawFound);
    }
    return `Not found withdraw request with:: userId(${withdrawDto.userId}) and withdrawId(${withdrawDto.withdrawRequestId})`;
  }
}
