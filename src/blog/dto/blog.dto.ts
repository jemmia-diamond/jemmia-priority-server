import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { HaravanBlogDto } from '../../haravan/dto/haravan-blog.dto';
import {
  IsArray,
  IsDefined,
  IsNumber,
  IsOptional,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { EUserRole } from '../../user/enums/user-role.enum';
import { Type } from 'class-transformer';

class PostDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @IsNumber()
  discountAmount?: number;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  @IsUrl()
  pdfUrl?: string;

  @ApiProperty({
    isArray: true,
    type: () => String,
  })
  @IsOptional()
  @IsArray()
  @IsDefined()
  @Type(() => String)
  userRole?: EUserRole[];

  haravanId?: number;
}

export class BlogDto extends HaravanBlogDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Type(() => PostDto)
  @ValidateNested()
  post: PostDto;
}
