import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { User } from '../../user/entities/user.entity';
import { EPartnerCustomer } from '../enums/partner-customer.enum';
import { ECouponRefType } from '../enums/copon-ref.enum';

@Entity('coupon_refs')
export class CouponRef {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Chủ sở hữu coupon */
  @Exclude()
  @ManyToOne(() => User)
  owner: User;

  /** Người tạo coupon, đây sẽ là các user partnerA */
  @Exclude()
  @ManyToOne(() => User)
  partner: User;

  @Column('enum', { enum: EPartnerCustomer })
  partnerType: EPartnerCustomer;

  @Column('enum', { enum: ECouponRefType })
  type: ECouponRefType;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  startDate: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  endDate: Date;

  @Column('int')
  couponHaravanId: number;

  @Column('varchar')
  couponHaravanCode: string;

  /** Field này dùng để kiểm tra couponRef đã được partnerA / partnerB đi mua hàng lần đầu */
  @Column({ type: 'boolean', default: false })
  used: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;
}
