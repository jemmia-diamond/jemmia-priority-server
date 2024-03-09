import { ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsDateString, IsEmail, IsOptional, IsString, ValidateNested } from 'class-validator';

export class HaravanBlogSearchDto {
  /** Giới hạn kết quả trả về */
  @ApiPropertyOptional()
  @IsOptional()
  limit?: number;

  /** Trang trả về kết quả */
  @ApiPropertyOptional()
  @IsOptional()
  page?: number;

  /** Hạn chế kết quả sau ID được chỉ định */
  @ApiPropertyOptional()
  @IsOptional()
  since_id?: number;

  /** Địa chỉ Blog */
  @ApiPropertyOptional()
  @IsOptional()
  handle?: number;

  /** Chỉ trả về các fields trong list này */
  @ApiPropertyOptional()
  @IsOptional()
  fields?: Array<string>;

  /** Hiển thị các bài viết được tạo sau ngày đó (định dạng: 2008-12-31T02:01:27.483Z). */
  @ApiPropertyOptional()
  @IsOptional()
  created_at_min?: Date;

  /** Hiển thị các bài viết được tạo trước ngày (định dạng: 2008-12-31T02:01:27.483Z). */
  @ApiPropertyOptional()
  @IsOptional()
  created_at_max?: Date;

  /** Hiển thị các bài viết được cập nhật lần cuối sau ngày (định dạng: 2008-12-31T02:01:27.483Z). */
  @ApiPropertyOptional()
  @IsOptional()
  updated_at_min?: Date;

  /** Hiển thị các bài viết được cập nhật lần cuối trước ngày (định dạng: 2008-12-31T02:01:27.483Z). */
  @ApiPropertyOptional()
  @IsOptional()
  updated_at_max?: Date;

  /** Hiển thị các bài viết được xuất bản sau ngày đó (định dạng: 2008-12-31T02:01:27.483Z). */
  @ApiPropertyOptional()
  @IsOptional()
  published_at_min?: Date;

  /** Hiển thị các bài viết được xuất bản trước ngày (định dạng: 2008-12-31T02:01:27.483Z). */
  @ApiPropertyOptional()
  @IsOptional()
  published_at_max?: Date;

  /** 
    published - Show only published articles
    unpublished - Show only unpublished articles
    any - Show all articles (default) 
  */
  @ApiPropertyOptional()
  @IsOptional()
  published_status?: string;

  /** Tác giả bài viết. */
  @ApiPropertyOptional()
  @IsOptional()
  author?: string;
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
  image: {
    src?: string;

    attachment?: string;

    filename?: string;

    createdAt?: Date;
  }
}
