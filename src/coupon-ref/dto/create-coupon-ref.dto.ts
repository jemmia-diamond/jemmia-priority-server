import { IsDateString, IsDefined, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EPartnerCustomer } from '../enums/partner-customer.enum';
import { ECouponRefType } from '../enums/copon-ref.enum';

export class CreateCouponRefDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  userId?: string;

  @ApiProperty({
    enum: EPartnerCustomer,
  })
  @IsEnum(EPartnerCustomer)
  @IsDefined()
  partnerType: EPartnerCustomer;

  @ApiProperty({
    enum: ECouponRefType,
  })
  @IsEnum(ECouponRefType)
  @IsDefined()
  type: ECouponRefType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @IsDateString()
  endDate?: string;
}
