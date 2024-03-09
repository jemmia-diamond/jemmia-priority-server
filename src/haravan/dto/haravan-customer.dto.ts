import { ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class HaravanCustomerSearchDto {
  /** Sắp xếp kết quả trả về */
  @ApiPropertyOptional()
  @IsOptional()
  order?: 'DESC';

  /** Nội dung tìm kiếm khách hàng */
  @ApiPropertyOptional()
  @IsOptional()
  query?: string;

  /** Tìm kiếm khách hàng được tạo vào ngày này */
  @ApiPropertyOptional()
  @IsOptional()
  @Expose({ name: 'created_at_min' })
  createdAtMin?: Date;

  /** Giới hạn kết quả trả về */
  @ApiPropertyOptional()
  @IsOptional()
  limit?: number;

  /** Trang trả về kết quả */
  @ApiPropertyOptional()
  @IsOptional()
  page?: number;

  /**
   * Chỉ trả về các fields trong list này
   */
  @ApiPropertyOptional()
  @IsOptional()
  fields?: Array<string>;
}

class CustomerAddress {
  @IsOptional()
  id?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @Expose({ name: 'first_name' })
  firstName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @Expose({ name: 'last_name' })
  lastName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  default?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  zip?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  address1?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  address2?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  company?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @Expose({ name: 'country_code' })
  countryCode?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @Expose({ name: 'province_code' })
  provinceCode?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @Expose({ name: 'district_code' })
  districtCode?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @Expose({ name: 'ward_code' })
  wardCode?: string;
}

export class HaravanCustomerDto {
  @IsOptional()
  id?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @Expose({ name: 'first_name' })
  firstName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @Expose({ name: 'last_name' })
  lastName?: string;

  @ApiPropertyOptional()
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    type: Boolean,
  })
  @IsBoolean()
  @IsOptional()
  @Expose({ name: 'accepts_marketing' })
  acceptsMarketing = false;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  tags?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  note?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  birthday?: Date;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  gender?: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  @Expose({ name: 'verified_email' })
  verifiedEmail?: boolean = false;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  password?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @Expose({ name: 'password_confirmation' })
  passwordConfirmation?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  @Expose({ name: 'send_email_welcome' })
  sendEmailWelcome?: boolean = false;

  @ApiPropertyOptional({
    isArray: true,
    type: CustomerAddress,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CustomerAddress)
  addresses?: CustomerAddress[];

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Expose({ name: 'default_address' })
  @Type(() => CustomerAddress)
  defaultAddress?: CustomerAddress;

  @IsOptional()
  @Expose({ name: 'orders_count' })
  ordersCount?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  state?: 'Disabled' | 'Enabled';

  @IsOptional()
  @Expose({ name: 'created_at' })
  createdAt?: Date;
}
