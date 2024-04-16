import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { EUserRole } from '../../user/enums/user-role.enum';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('double', { nullable: true })
  discountAmount: number;

  @Column('varchar', { nullable: true })
  pdfUrl: string;

  @Column('json', { nullable: true })
  userRole: EUserRole[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;
}
