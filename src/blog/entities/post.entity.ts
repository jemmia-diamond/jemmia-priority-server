import { Column, Entity, PrimaryColumn } from 'typeorm';
import { EUserRole } from '../../user/enums/user-role.enum';

@Entity('posts')
export class Post {
  @Column('double', { default: 0 })
  discountAmount: number;

  @Column('varchar', { nullable: true })
  pdfUrl: string;

  @Column('enum', { enum: EUserRole })
  userRole: EUserRole;

  @PrimaryColumn('int', { unique: true })
  haravanId: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;
}
