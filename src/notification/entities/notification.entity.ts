import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { NotificationType } from '../enums/noti-type.enum';
import { ApiProperty } from '@nestjs/swagger';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id: string;

  @ManyToOne(() => User)
  @JoinColumn()
  @ApiProperty()
  receiver: User;

  @Column('varchar', { length: 24 })
  @ApiProperty()
  title: string;

  @Column('varchar', { length: 255, default: '' })
  @ApiProperty()
  description: string;

  @Column('boolean', { default: false })
  @ApiProperty()
  isSeen: boolean;

  @Column('enum', { enum: NotificationType, default: NotificationType.another })
  @ApiProperty()
  type: NotificationType;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;
}
