import { Expose, Type } from 'class-transformer';
import { IsEmail, IsOptional, ValidateNested } from 'class-validator';

export class HaravanCustomerSearchDto {
  /** Sắp xếp kết quả trả về */
  @IsOptional()
  order?: 'DESC';

  /** Nội dung tìm kiếm khách hàng */
  @IsOptional()
  query?: string;

  /** Tìm kiếm khách hàng được tạo vào ngày này */
  @IsOptional()
  created_at_min?: Date;

  /** Giới hạn kết quả trả về */
  @IsOptional()
  limit?: number;

  /** Trang trả về kết quả */
  @IsOptional()
  page?: number;

  /**
   * Chỉ trả về các fields trong list này
   */
  @IsOptional()
  fields?: Array<string>;
}

class CustomerAddress {
  @IsOptional()
  id?: number;

  @IsOptional()
  country?: string;

  @IsOptional()
  @Expose({ name: 'first_name' })
  firstName?: string;

  @IsOptional()
  @Expose({ name: 'last_name' })
  lastName?: string;

  @IsOptional()
  phone?: string;

  @IsOptional()
  default?: boolean;

  @IsOptional()
  zip?: string;

  @IsOptional()
  address1?: string;

  @IsOptional()
  address2?: string;

  @IsOptional()
  company?: string;

  @IsOptional()
  @Expose({ name: 'country_code' })
  countryCode?: string;

  @IsOptional()
  @Expose({ name: 'province_code' })
  provinceCode?: string;

  @IsOptional()
  @Expose({ name: 'district_code' })
  districtCode?: string;

  @IsOptional()
  @Expose({ name: 'ward_code' })
  wardCode?: string;
}

export class HaravanCustomerDto {
  @IsOptional()
  id?: number;

  @IsOptional()
  @Expose({ name: 'first_name' })
  firstName?: string;

  @IsOptional()
  @Expose({ name: 'last_name' })
  lastName?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsOptional()
  @Expose({ name: 'accepts_marketing' })
  acceptsMarketing?: string;

  @IsOptional()
  tags?: string;

  @IsOptional()
  note?: string;

  @IsOptional()
  phone?: string;

  @IsOptional()
  birthday?: Date;

  @IsOptional()
  gender?: string;

  @IsOptional()
  @Expose({ name: 'verified_email' })
  verifiedEmail?: boolean = false;

  @IsOptional()
  password?: string;

  @IsOptional()
  @Expose({ name: 'password_confirmation' })
  passwordConfirmation?: string;

  @IsOptional()
  @Expose({ name: 'send_email_welcome' })
  sendEmailWelcome?: boolean = false;

  @IsOptional()
  @ValidateNested()
  @Type(() => CustomerAddress)
  addresses?: CustomerAddress[];

  @IsOptional()
  @ValidateNested()
  @Expose({ name: 'default_address' })
  @Type(() => CustomerAddress)
  defaultDddress?: CustomerAddress;

  @IsOptional()
  @Expose({ name: 'orders_count' })
  ordersCount?: number;

  @IsOptional()
  state?: 'Disabled' | 'Enabled';

  @IsOptional()
  @Expose({ name: 'created_at' })
  createdAt?: Date;
}
