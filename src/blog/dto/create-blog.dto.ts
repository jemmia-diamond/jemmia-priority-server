import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateBlogDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty()
  @IsOptional()
  @MinLength(1)
  author?: string;

  @ApiProperty()
  @IsOptional()
  @MaxLength(128)
  @MinLength(10)
  tags?: string;

  @ApiProperty()
  @IsOptional()
  @MinLength(1)
  bodyHtml?: string;

  @ApiProperty()
  @IsOptional()
  @IsUrl()
  image?: string;

  @ApiProperty()
  @IsOptional()
  @IsDateString()
  publishedAt?: Date;
}
