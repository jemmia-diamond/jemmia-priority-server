import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
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

  @Column('text', { nullable: true })
  url: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column('text', { nullable: true })
  bodyHtml: string;

  @Column('enum', { nullable: true, enum: EBlogType })
  blogId: EBlogType;

  @Column('datetime', { default: () => 'CURRENT_TIMESTAMP' })
  publishedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column('json', { nullable: true })
  image: BlogImageDto;

  @JoinColumn()
  @OneToOne(() => Post)
  post: Post;
}
