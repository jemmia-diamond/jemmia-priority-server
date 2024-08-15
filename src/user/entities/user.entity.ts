import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { EUserRole } from '../enums/user-role.enum';
import { ECustomerRankNum } from '../../customer-rank/enums/customer-rank.enum';
import { UserBankingAccountDto } from '../dto/user-info';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** BASE ON CRM BIZFLY */
  @Column('varchar', { length: 128, nullable: true })
  crmId: string;

  @Column('integer', { nullable: true })
  haravanId: number;

  @Column('varchar', { length: 128 })
  authId: string;

  /** Lưu theo format +yxxx
   * @param {number} y: mã vùng
   */
  @Column('varchar', { length: 24, nullable: true })
  phoneNumber: string;

  @Column('varchar', { length: 512, nullable: true })
  name: string;

  @Column('text', { nullable: true })
  address1: string;

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
  @Column('double precision', { default: 0 })
  point: number;

  /** Điểm hạng thành viên của User */
  @Column('double precision', { default: 0 })
  rankPoint: number;

  /** Rank của user */
  @Column('integer', { default: ECustomerRankNum.silver })
  rank: ECustomerRankNum;

  /** Giá trị đơn hàng đã tích luỹ trong 12 tháng */
  @Column('double precision', { default: 0 })
  accumulatedOrderPoint: number;

  /** Giá trị doanh thu ref đã tích luỹ */
  @Column('double precision', { default: 0 })
  accumulatedRefPoint: number;

  /** Đánh dấu rằng user này đã login vào app */
  @Column('bool', { default: false })
  isLoggedIn: boolean;

  @Column('enum', { enum: EUserRole })
  role: EUserRole;

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP', nullable: true })
  rankUpdatedTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  rankExpirationTime: Date;

  @CreateDateColumn()
  createdAt: Date;

  @Column('varchar', { length: 32, unique: true })
  maKhachHang: string;

  /** Doanh thu tích luỹ haravan */
  @Column('double precision', { default: 0 })
  cumulativeTovRecorded: number;

  @Column('tinyint', { default: 0 })
  gender: number;

  @Column('varchar', { length: 128, default: '' })
  customerEmailUpdatePwa: string;

  @Column('varchar', { length: 10, default: '' })
  customerBirthdayUpdatePwa: string;

  @Column('json', { default: '{}' })
  bankingAccount: UserBankingAccountDto;

  @Column('text', { nullable: true })
  frontIDCardImageUrl: string;

  @Column('text', { nullable: true })
  backIDCardImageUrl: string;
}
