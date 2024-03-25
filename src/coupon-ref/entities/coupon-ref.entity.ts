import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { User } from '../../user/entities/user.entity';

@Entity('couponRefs')
export class CouponRef {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Exclude()
  @Column('varchar', { length: 255 })
  name: string;

  @Exclude()
  @ManyToOne(() => User)
  owner: User;

  @Exclude()
  @Column('int')
  percentReduce: number;

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
  receiveRankPoint: number;

  @Column('int')
  couponHaravanId: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;
}
