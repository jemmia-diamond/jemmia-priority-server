import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { ECouponType } from '../enums/gift-type.enum';
import { IsUrl } from 'class-validator';
import { CouponRedeemed } from './coupon-user.entity';

@Entity('coupons')
export class Coupon {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Exclude()
  @Column('enum', { enum: ECouponType })
  type: ECouponType;

  @Exclude()
  @Column('varchar', { length: 255 })
  ten: string;

  @IsUrl()
  @Column('varchar')
  urlImage: string;

  @Exclude()
  @Column('varchar')
  detail: string;

  @Exclude()
  @Column('int')
  quantityLimit: number;

  @Column('datetime', { default: () => 'CURRENT_TIMESTAMP' })
  startDate: Date;

  @Column({ type: 'datetime', nullable: true })
  endDate: Date;

  @Column('datetime', { default: () => 'CURRENT_TIMESTAMP', nullable: true })
  startDateHaravan: Date;

  @Column({ type: 'datetime', nullable: true })
  endDateHaravan: Date;

  @Exclude()
  @Column('int')
  point: number;

  @Column('int')
  couponId: number;

  @Column('varchar')
  product: string;

  @CreateDateColumn()
  createdDate: Date;

  @OneToMany(() => CouponRedeemed, (couponUser) => couponUser.coupon)
  couponUser: CouponRedeemed[];
}
