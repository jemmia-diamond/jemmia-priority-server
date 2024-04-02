import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Withdraw } from './entities/withdraw.entity';

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

  async save(withdraw: Withdraw) {
    console.log(withdraw);
    return await this.withdrawRepostitory.save(withdraw);
  }

  findAll(page: number, size: number) {
    return this.withdrawRepostitory.find({
      skip: (page - 1) * size,
      take: size,
      order: {
        createdDate: 'DESC',
      },
    });
  }

  findAllAssetCount(): Promise<number> {
    return this.withdrawRepostitory.count();
  }
}
