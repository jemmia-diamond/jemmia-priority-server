import {
  Column,
  Entity,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { EUserRole } from '../enums/user-role.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Exclude()
  @PrimaryColumn('varchar', { length: 128, unique: true })
  haravanId: string;

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
  @Column('varchar', { length: 6, unique: true })
  inviteCode: string;

  /** Nếu user đăng ký nhập invite code được mời thì user mời đưa vào đây */
  @Exclude()
  @ManyToOne(() => User)
  invitedBy: User;

  /** Điểm thành viên của User */
  @Column('integer', { default: 0 })
  point: number;

  /** Điểm hạng thành viên của User */
  @Column('integer', { default: 0 })
  rankPoint: number;

  @Column('enum', { enum: EUserRole })
  role: EUserRole;
}
