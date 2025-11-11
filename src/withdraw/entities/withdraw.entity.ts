import { Exclude } from 'class-transformer';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { EWithdrawStatus } from '../dto/withdraw-status.dto';
import { IsOptional } from 'class-validator';

@Entity('withdraws')
export class Withdraw {
  @IsOptional()
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column('varchar', { default: '' })
  bankNumber: string;

  @Column('varchar', { default: '' })
  bankName: string;

  @Column('double precision', { default: 0 })
  amount: number;

  //Số dư còn lại
  @Column('double precision', { default: 0 })
  remainAmount: number;

  @Column('enum', { enum: EWithdrawStatus, default: EWithdrawStatus.pending })
  status: EWithdrawStatus;

  @Exclude()
  @ManyToOne(() => User)
  user: User;

  @IsOptional()
  @CreateDateColumn()
  createdDate?: Date;

  @Column('double precision', { default: 0 })
  withdrawPoint: number;

  @Column('double precision', { default: 0 })
  withdrawCashAmount: number;
}
