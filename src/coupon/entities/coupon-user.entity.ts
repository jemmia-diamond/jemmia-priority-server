import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Coupon } from './coupon.entity';

@Entity('coupon_redeemeds')
export class CouponRedeemed {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdDate: Date;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Coupon)
  coupon: Coupon;
}
