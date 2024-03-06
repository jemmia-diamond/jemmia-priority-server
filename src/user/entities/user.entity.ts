import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Exclude()
  @Column('varchar', { length: 128, unique: true })
  authId: string;

  @Column('varchar', { length: 128 })
  name: string;

  /** Lưu theo format +yxxx
   * @param {number} y: mã vùng
   */
  @Exclude()
  @Column('varchar', { length: 24, unique: true, nullable: true })
  phoneNumber: string;

  @Column('text', { nullable: true })
  avatarUrl: string;

  @Exclude()
  @Column('text', { nullable: true })
  refreshToken: string;

  @Exclude()
  @Column('boolean', { default: false })
  totpAuthEnabled: boolean;

  /** Lưu secret otp của app tOTP */
  @Exclude()
  @Column('varchar', { length: 32, unique: true })
  totpSecret: string;

  /** Lưu mã OTP được gửi về mail */
  @Exclude()
  @Column('varchar', { length: 6, nullable: true })
  otpCode: string;

  @Exclude()
  @Column('varchar', { length: 6, unique: true })
  inviteCode: string;

  /** Nếu user đăng ký nhập invite code được mời thì user mời đưa vào đây */
  @Exclude()
  @ManyToOne(() => User)
  invitedBy: User;

  /** XP level của User */
  @Column('integer', { default: 0 })
  xp: number;

  @Column('text', { nullable: true })
  socialTwitterUrl: string;

  @Column('text', { nullable: true })
  socialFbUrl: string;

  /** Trạng thái user đã được KYC hay chưa */
  @Exclude()
  @Column('boolean', { default: false })
  isKyc: string;

  /** Link ảnh gương mặt của người dùng */
  @Exclude()
  @Column('text', { nullable: true })
  kycFaceImageUrl: string;

  /** Số ngày user hoạt động */
  @Column('integer', { default: 0 })
  dayActive: number;
  
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastTimeOnline: Date;
}
