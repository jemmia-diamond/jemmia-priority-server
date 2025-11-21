import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CouponRef } from '../coupon-ref/entities/coupon-ref.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class SyncCrmService {
  constructor(
    @InjectRepository(CouponRef)
    private readonly couponRefRepository: Repository<CouponRef>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async syncCouponRef(filter: {
    updatedInCrm?: boolean;
    haravanId?: string;
  }): Promise<any[]> {
    const query = this.couponRefRepository
      .createQueryBuilder('cf')
      .select([
        'cf.id AS "id"',
        'u.haravanId AS "haravanId"',
        'u2.haravanId AS "userHaravanId"',
        'cf.couponHaravanCode AS "couponHaravanCode"',
        'cf.couponHaravanId AS "couponHaravanId"',
        'o.paymentStatus AS "paymentStatus"',
        'cf.usedByName AS "usedByName"',
        'o.totalPrice AS "totalPrice"',
        'o.cashBackRef AS "cashBackRef"',
        'cf.createdDate AS "createdDate"',
        'cf.startDate AS "startDate"',
        'cf.endDate AS "endDate"',
      ])
      .leftJoin('users', 'u', 'cf.ownerId = u.id')
      .leftJoin('orders', 'o', 'o.couponRefId = cf.id')
      .leftJoin('users', 'u2', 'cf.usedById = u2.id')
      .where('(o.paymentStatus = :paid OR o.paymentStatus = :pending)', {
        paid: 'paid',
        pending: 'pending',
      });

    if (filter.updatedInCrm !== undefined) {
      query.andWhere('cf.updatedInCrm = :updatedInCrm', {
        updatedInCrm: filter.updatedInCrm,
      });
    }

    if (filter?.haravanId) {
      const user = await this.userRepository.findOne({
        where: { haravanId: parseInt(filter.haravanId) },
      });

      if (user) {
        query.andWhere('cf.ownerId = :userId', {
          userId: user.id,
        });
      } else {
        return [];
      }
    }

    const result = await query.getRawMany();

    if (result.length > 0 && !filter?.haravanId) {
      await this.couponRefRepository.update(
        { id: In(result.map((r) => r.id)) },
        { updatedInCrm: true },
      );
    }

    return result;
  }
}
