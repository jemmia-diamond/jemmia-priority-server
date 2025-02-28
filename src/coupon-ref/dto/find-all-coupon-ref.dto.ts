import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ECouponRefType } from '../enums/coupon-ref.enum';
import { EUserRole } from '../../user/enums/user-role.enum';

export class FindAllCouponRef {
  @IsBoolean()
  @IsOptional()
  isUsed?: boolean;

  @IsNumber()
  page: number = 1;

  @IsNumber()
  limit: number = 999999;

  @IsOptional()
  @IsEnum(ECouponRefType)
  type: ECouponRefType;

  @IsOptional()
  @IsEnum(EUserRole)
  role: EUserRole;

  @IsString()
  @IsOptional()
  ownerId?: string;
}
