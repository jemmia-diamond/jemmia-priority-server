import { ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsDefined,
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
  @IsDefined()
  order?: 'DESC';

  /** Nội dung tìm kiếm khách hàng */
  @ApiPropertyOptional()
  @IsOptional()
  query?: string;

  /** Tìm kiếm khách hàng được tạo vào ngày này */
  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'created_at_min' })
  createdAtMin?: Date;

  /** Giới hạn kết quả trả về */
  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  limit?: number;

  /** Trang trả về kết quả */
  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  page?: number;

  /**
   * Chỉ trả về các fields trong list này
   */
  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  fields?: Array<string>;
}

class CustomerAddress {
  id?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @IsDefined()
  country?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'first_name' })
  firstName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'last_name' })
  lastName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @IsDefined()
  phone?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  @IsDefined()
  default?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @IsDefined()
  zip?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @IsDefined()
  address1?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @IsDefined()
  address2?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @IsDefined()
  company?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'country_code' })
  countryCode?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'province_code' })
  provinceCode?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'district_code' })
  districtCode?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'ward_code' })
  wardCode?: string;
}

export class HaravanCustomerDto {
  id?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'first_name' })
  firstName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'last_name' })
  lastName?: string;

  @ApiPropertyOptional()
  @IsEmail()
  @IsOptional()
  @IsDefined()
  email?: string;

  @ApiPropertyOptional({
    type: Boolean,
  })
  @IsBoolean()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'accepts_marketing' })
  acceptsMarketing = false;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @IsDefined()
  tags?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @IsDefined()
  note?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @IsDefined()
  phone?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  @IsDefined()
  birthday?: Date;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @IsDefined()
  gender?: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'verified_email' })
  verifiedEmail?: boolean = false;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @IsDefined()
  password?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'password_confirmation' })
  passwordConfirmation?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'send_email_welcome' })
  sendEmailWelcome?: boolean = false;

  @ApiPropertyOptional({
    isArray: true,
    type: CustomerAddress,
  })
  @IsOptional()
  @IsDefined()
  @ValidateNested()
  @Type(() => CustomerAddress)
  addresses?: CustomerAddress[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @ValidateNested()
  @Expose({ name: 'default_address' })
  @Type(() => CustomerAddress)
  defaultAddress?: CustomerAddress;

  @IsOptional()
  @IsDefined()
  @Expose({ name: 'orders_count' })
  ordersCount?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @IsDefined()
  state?: 'Disabled' | 'Enabled';

  @IsOptional()
  @IsDefined()
  @Expose({ name: 'created_at' })
  createdAt?: Date;

  @Expose({ name: 'multipass_identifier' })
  multipassIdentifier?: string;

  @Expose({ name: 'last_order_id' })
  lastOrderId?: number;

  @Expose({ name: 'last_order_name' })
  lastOrderName?: string;

  @Expose({ name: 'total_spent' })
  totalSpent?: number;

  @Expose({ name: 'total_paid' })
  totalPaid?: number;

  @Expose({ name: 'updated_at' })
  updatedAt?: string;

  @Expose({ name: 'group_name' })
  groupName?: string;

  @Expose({ name: 'last_order_date' })
  lastOrderDate?: string;
}
