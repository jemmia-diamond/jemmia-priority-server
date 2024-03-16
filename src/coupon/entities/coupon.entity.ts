import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { ECouponType } from '../enums/coupon-type.enum';
import { IsUrl } from 'class-validator';

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
}
