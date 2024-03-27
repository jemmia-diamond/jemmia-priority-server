import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { paymentStatusEnum } from '../enum/payment-status.dto';
import { User } from '../../user/entities/user.entity';
import { CouponRef } from '../../coupon-ref/entities/coupon-ref.entity';
import { Exclude } from 'class-transformer';

@Entity('coupon_refs')
export class Order {
  @PrimaryColumn('haravanOrderId')
  id: number;

  @Column('double')
  totalPrice: number;

  @Column('double')
  cashBack: number;

  @Column('double')
  cashBackRef: number;

  @Column('double')
  cashBackRefA: number;

  @Column('enum', { enum: paymentStatusEnum })
  paymentStatus: paymentStatusEnum;

  @Exclude()
  @ManyToOne(() => User)
  user: User;

  @Exclude()
  @ManyToOne(() => CouponRef)
  counponRef: CouponRef;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;
}
