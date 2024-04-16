import {
  Column,
  Entity,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { EUserRole } from '../enums/user-role.enum';
import { ECustomerRankNum } from '../../customer-rank/enums/customer-rank.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Exclude()
  @Column('integer', { nullable: true })
  haravanId: number;

  @Exclude()
  @PrimaryColumn('varchar', { length: 128, unique: true })
  authId: string;

  /** Lưu theo format +yxxx
   * @param {number} y: mã vùng
   */
  @Exclude()
  @Column('varchar', { length: 24, unique: true, nullable: true })
  phoneNumber: string;

  @Exclude()
  @Column('text', { nullable: true })
  refreshToken: string;

  @Exclude()
  @Column('varchar', { length: 6, unique: true, nullable: true })
  inviteCode: string;

  /** Nếu user sử dụng coupon ref cho lần đầu mua hàng thì đưa chủ coupon vào đây */
  @Exclude()
  @ManyToOne(() => User)
  invitedBy?: User;

  /** Số lượng user đã mời thành công */
  @Column('integer', { default: 0 })
  invitesCount: number;

  /** Điểm doanh thu được CASHBACK của User */
  @Column('double', { default: 0 })
  point: number;

  /** Điểm hạng thành viên của User */
  @Column('double', { default: 0 })
  rankPoint: number;

  /** Rank của user */
  @Column('integer', { default: ECustomerRankNum.silver })
  rank: ECustomerRankNum;

  /** Giá trị đơn hàng đã tích luỹ */
  @Column('double', { default: 0 })
  accumulatedOrderPoint: number;

  @Column('enum', { enum: EUserRole })
  role: EUserRole;

  @Column({ type: 'timestamp', nullable: true })
  rankExpirationTime: Date;
}
