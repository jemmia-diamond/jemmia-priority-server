import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { ECouponType } from '../enums/gift-type.enum';
import { IsUrl } from 'class-validator';
import { CouponUser } from './coupon-user.entity';

@Entity('gifts')
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

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  startDate: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  endDate: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  startDateHaravan: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  endDateHaravan: Date;

  @Exclude()
  @Column('int')
  point: number;

  @Column('int')
  couponId: number;

  @Column('varchar')
  product: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @OneToMany(() => CouponUser, (couponUser) => couponUser.coupon)
  couponUser: CouponUser[];
}
