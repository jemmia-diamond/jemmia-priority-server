import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { User } from '../../user/entities/user.entity';
import { EUserRole } from '../../user/enums/user-role.enum';
import { ECouponRefType } from '../enums/coupon-ref.enum';

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
  @ManyToOne(() => CouponRef)
  partnerCoupon: CouponRef;

  @Column('enum', { enum: EUserRole })
  role: EUserRole;

  @Column('enum', { enum: ECouponRefType })
  type: ECouponRefType;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  startDate: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  endDate: Date;

  @Column('int', { nullable: true })
  couponHaravanId: number;

  @Column('varchar', { nullable: true })
  couponHaravanCode: string;

  @Column('varchar', { nullable: false })
  ownerId: string;

  /** Field này dùng để kiểm tra couponRef đã được partnerA / partnerB đi mua hàng lần đầu */
  @Column({ type: 'boolean', default: false })
  used: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;
}
