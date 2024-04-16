import {
  IsDate,
  IsDefined,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EUserRole } from '../../user/enums/user-role.enum';
import { ECouponRefType } from '../enums/coupon-ref.enum';

export class CreateCouponRefDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  ownerId?: string;

  @ApiProperty({
    enum: ECouponRefType,
  })
  @IsEnum(ECouponRefType)
  @IsDefined()
  type: ECouponRefType;

  @ApiProperty({
    enum: EUserRole,
  })
  @IsEnum(EUserRole)
  @IsDefined()
  role: EUserRole;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @IsDate()
  startDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @IsDate()
  endDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @IsString()
  note?: string;
}
