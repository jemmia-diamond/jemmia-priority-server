import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { User } from '../../user/entities/user.entity';
import { EUserRole } from '../../user/enums/user-role.enum';
import { ECouponRefType } from '../enums/coupon-ref.enum';
import { Order } from '../../order/entities/order.entity';

@Entity('coupon_refs')
export class CouponRef {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Chủ sở hữu coupon */
  @Exclude()
  @ManyToOne(() => User)
  owner: User;

  @Column('text', { nullable: true })
  note: string;

  /** Role coupon, khi user sử dụng mã này sẽ được set role tương ứng */
  @Column('enum', { enum: EUserRole })
  role: EUserRole;

  @Column('enum', { enum: ECouponRefType })
  type: ECouponRefType;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  startDate: Date;

  // @OneToMany(() => Order, (order) => order.couponRef)
  // orders: Order[];

  @Column({ type: 'timestamp', nullable: true })
  endDate: Date;

  @Column('int', { nullable: true })
  couponHaravanId: number;

  @Column('varchar', { nullable: true })
  couponHaravanCode: string;

  /** Field này dùng để kiểm tra couponRef đã được partnerA / partnerB đi mua hàng lần đầu */
  @Column({ type: 'boolean', default: false })
  used: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;
}
