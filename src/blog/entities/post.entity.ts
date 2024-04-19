import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EUserRole } from '../../user/enums/user-role.enum';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('double precision', { nullable: true })
  discountAmount: number;

  @Column('varchar', { nullable: true })
  pdfUrl: string;

  @Column('json', { nullable: true })
  userRole: EUserRole[];

  @CreateDateColumn()
  createdDate: Date;
}
