import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsDefined, IsEnum, IsOptional, ValidateNested } from 'class-validator';
import { HaravanCustomerDto } from './haravan-customer.dto';

export enum EFinancialStatus {
  pending = 'pending',
  paid = 'paid',
  partiallyPaid = 'partially_paid',
  refunded = 'refunded',
  voided = 'voided',
  partiallyRefunded = 'partially_refunded',
  cancelled = 'cancelled',
}

export enum EFulfillmentStatus {
  unShipped = 'un_shipped',
  shipped = 'shipped',
  partial = 'partial',
  notfulfilled = 'notfulfilled',
}

export enum EStatus {
  open = 'open',
  closed = 'closed',
  cancelled = 'cancelled',
  any = 'any',
}

class Image {
  @ApiProperty()
  @IsOptional()
  @IsDefined()
  src?: string;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  attactment?: string;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  filename?: string;
}

export class HaravanOrderSearchDto {
  /** Giới hạn kết quả trả về */
  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  ids?: Array<number>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  limit?: number;

  /** Trang trả về kết quả */
  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'since_id' })
  since_id?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  handle?: number;

  /** Hiển thị các bài viết được tạo sau ngày đó (định dạng: 2008-12-31T02:01:27.483Z). */
  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'created_at_min' })
  created_at_min?: string;

  /** Hiển thị các bài viết được tạo trước ngày (định dạng: 2008-12-31T02:01:27.483Z). */
  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'created_at_max' })
  created_at_max?: string;

  /** Hiển thị các bài viết được cập nhật lần cuối sau ngày (định dạng: 2008-12-31T02:01:27.483Z). */
  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'updated_at_min' })
  updated_at_min?: string;

  /** Hiển thị các bài viết được cập nhật lần cuối trước ngày (định dạng: 2008-12-31T02:01:27.483Z). */
  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'updated_at_max' })
  updated_at_max?: string;

  /** Hiển thị các đơn hàng được nhập sau ngày. (định dạng: 2021-10-20T14:07:45.084Z) */
  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'processed_at_min' })
  processed_at_min?: string;

  /** Hiển thị các đơn hàng đã nhập trước ngày. (định dạng: 2021-10-20T14:07:45.084Z) */
  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'processed_at_max' })
  processed_at_max?: string;

  @ApiPropertyOptional({
    enum: EFinancialStatus,
  })
  @IsOptional()
  @IsDefined()
  @IsEnum(EFinancialStatus)
  @Expose({ name: 'financial_status' })
  financial_status?: EFinancialStatus;

  @ApiPropertyOptional({
    enum: EFulfillmentStatus,
  })
  @IsOptional()
  @IsDefined()
  @IsEnum(EFulfillmentStatus)
  @Expose({ name: 'fulfillment_status' })
  fulfillment_status?: EFulfillmentStatus;

  @ApiPropertyOptional({
    enum: EStatus,
  })
  @IsOptional()
  @IsDefined()
  @IsEnum(EStatus)
  status?: EStatus;

  /** Chỉ trả về các fields trong list này */
  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  fields?: Array<string>;

  /** Sắp xếp dữ liệu phản hồi. Các trường có thể sắp xếp theo là created_at và updated_at */
  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  order?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  customer?: HaravanCustomerDto;
}

class BillingAddress {
  @ApiProperty()
  @IsOptional()
  @IsDefined()
  address1?: string;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  address2?: string;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  city?: string;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  company?: string;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  country?: string;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'first_name' })
  first_name?: string;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  id?: number;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'last_name' })
  last_name?: string;

  @ApiProperty()
  @IsOptional()
  // @IsPhoneNumber()
  @IsDefined()
  phone?: number;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  province?: string;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  zip?: string;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  name?: string;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'province_code' })
  province_code?: string;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'country_code' })
  country_code?: string;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  default?: string;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  district?: string;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'district_code' })
  district_code?: string;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  ward?: string;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'ward_code' })
  ward_code?: string;
}

class ClientDetails {
  @ApiProperty()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'accept_language' })
  accept_language?: string;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'browser_ip' })
  browser_ip?: string;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'session_hash' })
  session_hash?: string;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'user_agent' })
  user_agent?: string;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'browser_height' })
  browser_height?: string;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'browser_width' })
  browser_width?: string;
}

class LineItems {
  @ApiProperty()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'fulfillable_quantity' })
  fulfillable_quantity?: number;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'fulfillment_service' })
  fulfillment_service?: string;

  @ApiProperty({
    enum: EFulfillmentStatus,
  })
  @IsEnum(EFulfillmentStatus)
  @IsDefined()
  @Expose({ name: 'fulfillment_status' })
  fulfillment_status?: EFulfillmentStatus;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  grams?: number;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  id?: number;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  price?: number;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'price_original' })
  price_original?: number;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'price_promotion' })
  price_promotion?: number;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'product_id' })
  product_id?: number;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  quantity?: number;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'requires_shipping' })
  requires_shipping?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  sku?: string;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  title?: string;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'variant_id' })
  variant_id?: number;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'variant_title' })
  variant_title?: string;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  vendor?: string;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  type?: string;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  name?: string;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'gift_card' })
  gift_card?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  taxable?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'tax_lines' })
  tax_lines?: string;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'product_exists' })
  product_exists?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  barcode?: string;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  properties?: string;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'total_discount' })
  total_discount?: number;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'applied_discounts' })
  applied_discounts?: Array<number>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Type(() => Image)
  @ValidateNested()
  image: Image;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'not_allow_promotion' })
  not_allow_promotion?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'ma_cost_amount' })
  ma_cost_amount?: number;
}

class ShippingAddress {
  @ApiProperty()
  @IsOptional()
  @IsDefined()
  address1?: string;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  address2?: string;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  city?: string;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  company?: string;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  country?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'first_name' })
  first_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'last_name' })
  last_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  latitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  longitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  // @IsPhoneNumber()
  phone?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  province?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  zip?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'province_code' })
  province_code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'country_code' })
  country_code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'district_code' })
  district_code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  district?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'ward_code' })
  ward_code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  ward?: string;
}

export class DiscountCodeItem {
  amount: number;
  code: string;
  type: string;
  is_coupon_code: boolean;
}
class ShippingLines {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  price?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  source?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  title?: string;
}

class Transactions {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  amount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  authorization?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'created_at' })
  createdAt?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'device_id' })
  deviceId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  gateway?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  id?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  kind?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'order_id' })
  orderId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  receipt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  test?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'user_id' })
  userId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'location_id' })
  locationId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'payment_details' })
  paymentDetails?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'parent_id' })
  parentId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  currency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'haravan_transaction_id' })
  haravanTransactionId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'external_transaction_id' })
  externalTransactionId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'send_email' })
  sendEmail?: boolean;
}

export class HaravanOrderDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Type(() => BillingAddress)
  @ValidateNested()
  @Expose({ name: 'billing_address' })
  billing_address: BillingAddress;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'browser_ip' })
  browser_ip?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'buyer_accepts_marketing' })
  buyer_accepts_marketing?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'cancel_reason' })
  cancel_reason?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'cancelled_at' })
  cancelled_at?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'cart_token' })
  cart_token?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'checkout_token' })
  checkout_token?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Type(() => ClientDetails)
  @ValidateNested()
  @Expose({ name: 'client_details' })
  client_details: ClientDetails;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'closed_at' })
  closed_at?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'created_at' })
  created_at?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  currency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Type(() => HaravanCustomerDto)
  @ValidateNested()
  customer: HaravanCustomerDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'discount_codes' })
  discount_codes?: Array<DiscountCodeItem>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  // @IsEmail()
  email?: string;

  @ApiProperty({
    enum: EFinancialStatus,
  })
  @IsEnum(EFinancialStatus)
  @IsDefined()
  @Expose({ name: 'financial_status' })
  financial_status?: EFinancialStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'fulfillments' })
  fulfillments?: Array<string>;

  @ApiProperty({
    enum: EFulfillmentStatus,
  })
  @IsEnum(EFulfillmentStatus)
  @IsDefined()
  @Expose({ name: 'fulfillment_status' })
  fulfillment_status?: EFulfillmentStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  tags?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  gateway?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'gateway_code' })
  gateway_code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  id?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'landing_site' })
  landing_site?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'landing_site_ref' })
  landing_site_ref?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  source?: string;

  @ApiPropertyOptional({
    isArray: true,
    type: LineItems,
  })
  @IsOptional()
  @IsDefined()
  @Type(() => LineItems)
  @ValidateNested()
  @Expose({ name: 'line_items' })
  line_items: LineItems;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  note?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  number?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'order_number' })
  order_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'processing_method' })
  processing_method?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'referring_site' })
  referring_site?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  refunds?: Array<string>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Type(() => ShippingAddress)
  @ValidateNested()
  @Expose({ name: 'shipping_address' })
  shipping_address: ShippingAddress;

  @ApiPropertyOptional({
    isArray: true,
    type: ShippingLines,
  })
  @IsOptional()
  @IsDefined()
  @Type(() => ShippingLines)
  @ValidateNested()
  @Expose({ name: 'shipping_lines' })
  shipping_lines: ShippingLines;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'source_name' })
  source_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'subtotal_price' })
  subtotal_price?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'tax_lines' })
  tax_lines?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'taxes_included' })
  taxes_included?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  token?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'total_discounts' })
  total_discounts?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'total_line_items_price' })
  total_line_items_price?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'total_price' })
  total_price?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'total_tax' })
  total_tax?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'total_weight' })
  total_weight?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'updated_at' })
  updated_at?: Date;

  @ApiPropertyOptional({
    isArray: true,
    type: Transactions,
  })
  @IsOptional()
  @IsDefined()
  @Type(() => Transactions)
  @ValidateNested()
  transactions: Transactions;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'note_attributes' })
  note_attributes?: Array<string>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'confirmed_at' })
  confirmed_at?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'closed_status' })
  closed_status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'cancelled_status' })
  cancelled_status?: 'cancelled' | 'uncancelled';

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'confirmed_status' })
  confirmed_status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'user_id' })
  user_id?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'device_id' })
  device_id?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'location_id' })
  location_id?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'ref_order_id' })
  ref_order_id?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'ref_order_number' })
  ref_order_number?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'utm_source' })
  utm_source?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'utm_medium' })
  utm_medium?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'utm_campaign' })
  utm_campaign?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'utm_term' })
  utm_term?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'utm_content' })
  utm_content?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'redeem_model' })
  redeem_model?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'omni_order_status' })
  omni_order_status?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'omni_order_status_name' })
  omni_order_status_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'location_assigned_at' })
  location_assigned_at?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'in_stock_at' })
  in_stock_at?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'out_of_stock_at' })
  out_of_stock_at?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'export_at' })
  export_at?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'complete_at' })
  complete_at?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  // @IsUrl()
  @Expose({ name: 'payment_url' })
  payment_url?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  // @IsEmail()
  @Expose({ name: 'contact_email' })
  contact_email?: string;
}
