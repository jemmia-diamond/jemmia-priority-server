import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { CouponRef } from '../../coupon-ref/entities/coupon-ref.entity';
import { Exclude } from 'class-transformer';
import { EFinancialStatus } from '../../haravan/dto/haravan-order.dto';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('integer')
  haravanOrderId: number;

  /** Tổng giá trị đơn hàng sau giảm */
  @Column('double precision', { default: 0 })
  totalPrice: number;

  /** Số tiền cashback cho người mua */
  @Column('double precision', { default: 0 })
  cashBack: number;

  /** Số tiền cashback cho người giới thiệu */
  @Column('double precision', { default: 0 })
  cashBackRef: number;

  /** Số tiền cashback cho partnerA khi partnerB giới thiệu thành công */
  @Column('double precision', { default: 0 })
  cashBackRefA: number;

  @Column('enum', { enum: EFinancialStatus, default: EFinancialStatus.pending })
  paymentStatus: EFinancialStatus;

  /** Chủ đơn hàng */
  @Exclude()
  @ManyToOne(() => User)
  user: User;

  /** Coupon giới thiệu được sử dụng trong đơn hàng */
  @Exclude()
  @ManyToOne(() => CouponRef)
  couponRef: CouponRef;

  @CreateDateColumn()
  createdDate: Date;

  @Column({ nullable: true })
  paymentType: string;
}
