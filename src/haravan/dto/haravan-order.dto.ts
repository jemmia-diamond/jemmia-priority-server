import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  IsDefined,
  IsEmail,
  IsEnum,
  IsOptional,
  IsPhoneNumber,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { HaravanCustomerDto } from './haravan-customer.dto';

export enum EFinancialStatus {
  pending = 'pending',
  paid = 'paid',
  partiallyPaid = 'partially_paid',
  refunded = 'refunded',
  voided = 'voided',
  partiallyRefunded = 'partially_refunded',
}

export enum EFulfillmentStatus {
  unShipped = 'un_shipped',
  shipped = 'shipped',
  partial = 'partial',
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
  sinceId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  handle?: number;

  /** Hiển thị các bài viết được tạo sau ngày đó (định dạng: 2008-12-31T02:01:27.483Z). */
  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'created_at_min' })
  createdAtMin?: string;

  /** Hiển thị các bài viết được tạo trước ngày (định dạng: 2008-12-31T02:01:27.483Z). */
  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'created_at_max' })
  createdAtMax?: string;

  /** Hiển thị các bài viết được cập nhật lần cuối sau ngày (định dạng: 2008-12-31T02:01:27.483Z). */
  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'updated_at_min' })
  updatedAtMin?: string;

  /** Hiển thị các bài viết được cập nhật lần cuối trước ngày (định dạng: 2008-12-31T02:01:27.483Z). */
  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'updated_at_max' })
  updatedAtMax?: string;

  /** Hiển thị các đơn hàng được nhập sau ngày. (định dạng: 2021-10-20T14:07:45.084Z) */
  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'processed_at_min' })
  processedAtMin?: string;

  /** Hiển thị các đơn hàng đã nhập trước ngày. (định dạng: 2021-10-20T14:07:45.084Z) */
  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'processed_at_max' })
  processedAtMax?: string;

  @ApiPropertyOptional({
    enum: EFinancialStatus,
  })
  @IsOptional()
  @IsDefined()
  @IsEnum(EFinancialStatus)
  @Expose({ name: 'financial_status' })
  financialStatus?: EFinancialStatus;

  @ApiPropertyOptional({
    enum: EFulfillmentStatus,
  })
  @IsOptional()
  @IsDefined()
  @IsEnum(EFulfillmentStatus)
  @Expose({ name: 'fulfillment_status' })
  fulfillmentStatus?: EFulfillmentStatus;

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
  firstName?: string;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  id?: number;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'last_name' })
  lastName?: string;

  @ApiProperty()
  @IsOptional()
  @IsPhoneNumber()
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
  provinceCode?: string;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'country_code' })
  countryCode?: string;

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
  districtCode?: string;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  ward?: string;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'ward_code' })
  wardCode?: string;
}

class ClientDetails {
  @ApiProperty()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'accept_language' })
  acceptLanguage?: string;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'browser_ip' })
  browserIp?: string;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'session_hash' })
  sessionHash?: string;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'user_agent' })
  userAgent?: string;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'browser_height' })
  browserHeight?: string;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'browser_width' })
  browserWidth?: string;
}

class LineItems {
  @ApiProperty()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'fulfillable_quantity' })
  fulfillableQuantity?: number;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'fulfillment_service' })
  fulfillmentService?: string;

  @ApiProperty({
    enum: EFulfillmentStatus,
  })
  @IsEnum(EFulfillmentStatus)
  @IsDefined()
  @Expose({ name: 'fulfillment_status' })
  fulfillmentStatus?: EFulfillmentStatus;

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
  priceOriginal?: number;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'price_promotion' })
  pricePromotion?: number;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'product_id' })
  productId?: number;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  quantity?: number;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'requires_shipping' })
  requiresShipping?: boolean;

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
  variantId?: number;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'variant_title' })
  variantTitle?: string;

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
  giftCard?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  taxable?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'tax_lines' })
  taxLines?: string;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'product_exists' })
  productExists?: boolean;

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
  totalDiscount?: number;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'applied_discounts' })
  appliedDiscounts?: Array<number>;

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
  notAllowPromotion?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'ma_cost_amount' })
  maCostAmount?: number;
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
  firstName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'last_name' })
  lastName?: string;

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
  @IsPhoneNumber()
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
  provinceCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'country_code' })
  countryCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'district_code' })
  districtCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  district?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'ward_code' })
  wardCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  ward?: string;
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
  billingAddress: BillingAddress;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'browser_ip' })
  browserIp?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'buyer_accepts_marketing' })
  buyerAcceptsMarketing?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'cancel_reason' })
  cancelReason?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'cancelled_at' })
  cancelledAt?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'cart_token' })
  cartToken?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'checkout_token' })
  checkoutToken?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Type(() => ClientDetails)
  @ValidateNested()
  @Expose({ name: 'client_details' })
  clientDetails: ClientDetails;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'closed_at' })
  closedAt?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'created_at' })
  createdAt?: Date;

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
  discountCodes?: Array<number>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @IsEmail()
  email?: string;

  @ApiProperty({
    enum: EFinancialStatus,
  })
  @IsEnum(EFinancialStatus)
  @IsDefined()
  @Expose({ name: 'financial_status' })
  financialStatus?: EFinancialStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'discount_codes' })
  fulfillments?: Array<string>;

  @ApiProperty({
    enum: EFulfillmentStatus,
  })
  @IsEnum(EFulfillmentStatus)
  @IsDefined()
  @Expose({ name: 'fulfillment_status' })
  fulfillmentStatus?: EFulfillmentStatus;

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
  gatewayCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  id?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'landing_site' })
  landingSite?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'landing_site_ref' })
  landingSiteRef?: string;

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
  lineItems: LineItems;

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
  orderNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'processing_method' })
  processingMethod?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'referring_site' })
  referringSite?: string;

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
  shippingAddress: ShippingAddress;

  @ApiPropertyOptional({
    isArray: true,
    type: ShippingLines,
  })
  @IsOptional()
  @IsDefined()
  @Type(() => ShippingLines)
  @ValidateNested()
  @Expose({ name: 'shipping_lines' })
  shippingLines: ShippingLines;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'source_name' })
  sourceName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'subtotal_price' })
  subtotalPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'tax_lines' })
  taxLines?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'taxes_included' })
  taxesIncluded?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  token?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'total_discounts' })
  totalDiscounts?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'total_line_items_price' })
  totalLineItemsPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'total_price' })
  totalPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'total_tax' })
  totalTax?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'total_weight' })
  totalWeight?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'updated_at' })
  updatedAt?: Date;

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
  noteAttributes?: Array<string>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'confirmed_at' })
  confirmedAt?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'closed_status' })
  closedStatus?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'cancelled_status' })
  cancelledStatus?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'confirmed_status' })
  confirmedStatus?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'user_id' })
  userId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'device_id' })
  deviceId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'location_id' })
  locationId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'ref_order_id' })
  refOrderId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'ref_order_number' })
  refOrderNumber?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'utm_source' })
  utmSource?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'utm_medium' })
  utmMedium?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'utm_campaign' })
  utmCampaign?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'utm_term' })
  utmTerm?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'utm_content' })
  utmContent?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'redeem_model' })
  redeemModel?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'omni_order_status' })
  omniOrderStatus?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'omni_order_status_name' })
  omniOrderStatusName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'location_assigned_at' })
  locationAssignedAt?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'in_stock_at' })
  inStockAt?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'out_of_stock_at' })
  outOfStockAt?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'export_at' })
  exportAt?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @Expose({ name: 'complete_at' })
  completeAt?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @IsUrl()
  @Expose({ name: 'payment_url' })
  paymentUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @IsEmail()
  @Expose({ name: 'contact_email' })
  contactEmail?: string;
}
