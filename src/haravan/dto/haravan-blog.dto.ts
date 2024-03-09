import { Expose, Type } from 'class-transformer';
import { IsEmail, IsOptional, ValidateNested } from 'class-validator';

export class HaravanBlogSearchDto {
  /** Sắp xếp kết quả trả về */
  @IsOptional()
  order?: 'DESC';

  /** Nội dung tìm kiếm khách hàng */
  @IsOptional()
  query?: string;

  /** Tìm kiếm khách hàng được tạo vào ngày này */
  @IsOptional()
  created_at_min?: Date;

  /** Giới hạn kết quả trả về */
  @IsOptional()
  limit?: number;

  /** Trang trả về kết quả */
  @IsOptional()
  page?: number;

  /**
   * Chỉ trả về các fields trong list này
   */
  @IsOptional()
  fields?: Array<string>;
}

class BlogImage {
  @IsOptional()
  src?: string;

  @IsOptional()
  attachment?: string;

  @IsOptional()
  filename?: string;

  @IsOptional()
  @Expose({ name: 'created_at' })
  createdAt?: Date;
}

export class HaravanBlogDto {
  @IsOptional()
  id?: number;

  @IsOptional()
  @Expose({ name: 'title' })
  title?: string;

  @IsOptional()
  @Expose({ name: 'created_at' })
  createdAt?: Date;

  @IsOptional()
  @Expose({ name: 'body_html' })
  bodyHtml?: string;

  @IsOptional()
  @Expose({ name: 'blog_id' })
  blogId?: number;

  @IsOptional()
  @Expose()
  author?: string;

  @IsOptional()
  @Expose({ name: 'user_id' })
  userId?: string;

  @IsOptional()
  @Expose({ name: 'published_at' })
  publishedAt?: Date;

  @IsOptional()
  @Expose({ name: 'updated_at' })
  updatedAt?: Date;

  @IsOptional()
  @Expose({ name: 'summary_html' })
  summaryHtml?: string;

  @IsOptional()
  @Expose({ name: 'template_suffix' })
  templateSuffix?: string;

  @IsOptional()
  handle?: string;

  @IsOptional()
  tags?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => BlogImage)
  image?: BlogImage;
}
