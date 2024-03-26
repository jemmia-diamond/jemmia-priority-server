import { IsDateString, IsDefined, IsEnum, IsOptional } from 'class-validator';
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
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @IsDateString()
  endDate?: string;
}
