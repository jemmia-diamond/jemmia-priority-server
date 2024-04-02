import { Exclude } from 'class-transformer';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
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
  bankCode: string;

  @Column('double', { default: 0 })
  amount: number;

  @Column('enum', { enum: EWithdrawStatus, default: EWithdrawStatus.pending })
  status: EWithdrawStatus;

  @Exclude()
  @ManyToOne(() => User)
  user: User;

  @IsOptional()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate?: Date;
}
