import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDefined,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { BlogpPublishedStatus as EBlogPublishedStatus } from '../enums/blog.enum';
import { EBlogType } from '../../blog/enums/blog-type.enum';
import { EUserRole } from '../../user/enums/user-role.enum';

export class HaravanBlogSearchDto {
  /** Filter trạng thái hiển thị */
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  published?: boolean;

  /** Filter ID bài viết ra khỏi kết quả */
  @ApiPropertyOptional({
    isArray: true,
    type: () => String,
  })
  @IsOptional()
  @IsDefined()
  @IsArray()
  @Type(() => String)
  excludeIds?: string[];

  /** Giới hạn kết quả trả về */
  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  limit?: number;

  /** Trang trả về kết quả */
  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'since_id' })
  sinceId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  handle?: number;

  /** Chỉ trả về các fields trong list này */
  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  fields?: Array<string>;

  /** Hiển thị các bài viết được tạo sau ngày đó (định dạng: 2008-12-31T02:01:27.483Z). */
  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'created_at_min' })
  createdAtMin?: string;

  /** Hiển thị các bài viết được tạo trước ngày (định dạng: 2008-12-31T02:01:27.483Z). */
  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'created_at_max' })
  createdAtMax?: string;

  /** Hiển thị các bài viết được cập nhật lần cuối sau ngày (định dạng: 2008-12-31T02:01:27.483Z). */
  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'updated_at_min' })
  updatedAtMin?: string;

  /** Hiển thị các bài viết được cập nhật lần cuối trước ngày (định dạng: 2008-12-31T02:01:27.483Z). */
  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'updated_at_max' })
  updatedAtMax?: string;

  /** Hiển thị các bài viết được xuất bản sau ngày đó (định dạng: 2008-12-31T02:01:27.483Z). */
  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'published_at_min' })
  publishedAtMin?: string;

  /** Hiển thị các bài viết được xuất bản trước ngày (định dạng: 2008-12-31T02:01:27.483Z). */
  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'published_at_max' })
  publishedAtMax?: string;

  /** 
    published - Show only published articles
    unpublished - Show only unpublished articles
    any - Show all articles (default) 
  */
  @ApiPropertyOptional({
    enum: EBlogPublishedStatus,
  })
  @IsOptional()
  @IsDefined()
  @IsEnum(EBlogPublishedStatus)
  @Expose({ name: 'published_status' })
  publishedStatus?: EBlogPublishedStatus;

  /** Tác giả bài viết. */
  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  author?: string;

  /** Blog chứa bài viết */
  @ApiProperty({
    enum: EBlogType,
  })
  @IsEnum(EBlogType)
  @IsDefined()
  blogId?: EBlogType;

  /** Blog chứa bài viết */
  @ApiPropertyOptional({
    enum: EUserRole,
  })
  @IsEnum(EUserRole)
  @IsOptional()
  userRole?: EUserRole;
}

class BlogImageDto {
  @ApiProperty()
  @IsUrl()
  @IsDefined()
  src?: string;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  attachment?: string;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  filename?: string;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'created_at' })
  createdAt?: string;
}

export class HaravanBlogDto {
  id?: number;

  @IsOptional()
  @IsDefined()
  @IsString()
  @ApiPropertyOptional()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'created_at' })
  createdAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @IsString()
  @Expose({ name: 'body_html' })
  bodyHtml?: string;

  /** Blog chứa bài viết */
  @ApiProperty({
    enum: EBlogType,
  })
  @IsEnum(EBlogType)
  @IsDefined()
  @Expose({ name: 'blog_id' })
  blogId?: EBlogType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @IsString()
  author?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @IsNumber()
  @Expose({ name: 'user_id' })
  userId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'published_at' })
  publishedAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'updated_at' })
  updatedAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @IsString()
  @Expose({ name: 'summary_html' })
  summaryHtml?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @IsString()
  @Expose({ name: 'template_suffix' })
  templateSuffix?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @IsString()
  handle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @IsString()
  tags?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Type(() => BlogImageDto)
  @ValidateNested()
  image: BlogImageDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @IsString()
  @Expose({ name: 'page_title' })
  pageTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @IsString()
  @Expose({ name: 'meta_description' })
  metaDescription?: string;
}
