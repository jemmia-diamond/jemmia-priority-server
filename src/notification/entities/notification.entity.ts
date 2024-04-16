import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { NotificationType } from '../enums/noti-type.enum';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn()
  receiver: User;

  @Column('text')
  title: string;

  @Column('text', { default: '' })
  description: string;

  @Column('boolean', { default: false })
  isSeen: boolean;

  @Column('enum', { enum: NotificationType, default: NotificationType.another })
  type: NotificationType;

  @CreateDateColumn()
  createdDate: Date;
}
