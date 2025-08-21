import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CouponRef } from '../coupon-ref/entities/coupon-ref.entity';

@Injectable()
export class SyncCrmService {
  constructor(
    @InjectRepository(CouponRef)
    private readonly couponRefRepository: Repository<CouponRef>,
  ) {}

  async syncCouponRef(filter: { updatedInCrm?: boolean }): Promise<any[]> {
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
      ])
      .leftJoin('users', 'u', 'cf.ownerId = u.id')
      .leftJoin('orders', 'o', 'o.couponRefId = cf.id')
      .leftJoin('users', 'u2', 'cf.usedById = u2.id')
      .where('cf.role = :role', { role: 'customer' })
      .andWhere('(o.paymentStatus = :paid OR o.paymentStatus = :pending)', {
        paid: 'paid',
        pending: 'pending',
      });

    if (filter.updatedInCrm !== undefined) {
      query.andWhere('cf.updatedInCrm = :updatedInCrm', {
        updatedInCrm: filter.updatedInCrm,
      });
    }

    const result = await query.getRawMany();

    if (result.length > 0) {
      try {
        await this.couponRefRepository.update(
          { id: In(result.map((r) => r.id)) },
          { updatedInCrm: true },
        );
      } catch (error) {
        console.error('Failed to update coupon refs:', error);
      }
    }

    return result;
  }
}
