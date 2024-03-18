import {
  IsArray,
  IsDefined,
  IsOptional,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { ECouponType } from '../enums/gift-type.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class Variants {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  productId: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  variantId: number;
}

export class GiftDto {
  @ApiPropertyOptional({
    enum: ECouponType,
  })
  @IsOptional()
  @IsDefined()
  type: ECouponType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  ten: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @IsUrl()
  urlImage: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  detail: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  quantityLimit: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  startDate: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  endDate: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  point: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  couponId: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  product: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  userList: Array<string>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  code: string;

  @ApiPropertyOptional({ type: () => Variants, isArray: true })
  @IsOptional()
  @IsDefined()
  @IsArray()
  @ValidateNested()
  @Type(() => Variants)
  variants?: Variants[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  appliesCustomerGroupId: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  minimumOrderAmount: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  locationIds: Array<number>;
}
