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
import { Type } from 'class-transformer';
import { EUserRole } from '../../user/enums/user-role.enum';

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
    type: EUserRole,
  })
  @IsArray()
  @IsDefined()
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
