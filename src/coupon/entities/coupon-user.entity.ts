import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Coupon } from './coupon.entity';

@Entity('coupon_users')
export class CouponUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Coupon)
  coupon: Coupon;
}
