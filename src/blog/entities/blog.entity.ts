import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EBlogType } from '../enums/blog-type.enum';
import { Post } from './post.entity';

class BlogImageDto {
  src?: string;
  attachment?: string;
  filename?: string;
  createdAt?: string;
}

@Entity('blogs')
export class Blog {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('text', { nullable: true })
  title: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column('text', { nullable: true })
  bodyHtml: string;

  @Column('enum', { nullable: true, enum: EBlogType })
  blogId: EBlogType;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  publishedAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Column('json', { nullable: true })
  image: BlogImageDto;

  @JoinColumn()
  @OneToOne(() => Post)
  post: Post;
}
