import {
  IsArray,
  IsDefined,
  IsEnum,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { EPartnerCustomer } from '../enums/partner-customer.enum';

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

export class CreateCouponRefDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  owner: string;

  @ApiProperty({
    enum: EPartnerCustomer,
  })
  @IsEnum(EPartnerCustomer)
  @IsDefined()
  partnerCustomer?: EPartnerCustomer;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  percentReduce: number;

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
  receiveRankPoint: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  product: string;

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
