import { ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDefined,
  IsEnum,
  IsISO8601,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import {
  ECouponApplyResource,
  ECouponDiscountType,
} from '../enums/coupon.enum';

export class HaravanCouponSearchDto {
  @ApiPropertyOptional()
  limit?: string;

  @ApiPropertyOptional()
  page?: string;

  @ApiPropertyOptional()
  @Expose({ name: 'since_id' })
  since_id?: string;

  @ApiPropertyOptional()
  code?: string;
}

class HaravanCouponVariantDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @IsDefined()
  @Expose({ name: 'product_id' })
  productId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @IsDefined()
  @Expose({ name: 'variant_id' })
  variantId?: number;
}

export class HaravanCouponDto {
  id?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @IsDefined()
  @Expose({ name: 'is_promotion' })
  isPromotion?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @IsDefined()
  @Expose({ name: 'once_per_customer' })
  oncePerCustomer?: boolean;

  @ApiPropertyOptional({
    enum: ECouponApplyResource,
  })
  @IsOptional()
  @IsEnum(ECouponApplyResource)
  @IsDefined()
  @Expose({ name: 'applies_to_resource' })
  appliesToResource?: ECouponApplyResource;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsDefined()
  @Expose({ name: 'applies_to_id' })
  appliesToId?: number;

  /** Dùng một lần cho mỗi đơn hàng */
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @IsDefined()
  @Expose({ name: 'applies_once' })
  appliesOnce?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsDefined()
  code?: string;

  /** Ngày hết hạn */
  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @IsISO8601()
  @Expose({ name: 'ends_at' })
  endsAt?: string;

  /** Giá trị đơn hàng tối thiểu khi áp mã */
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @IsDefined()
  @Expose({ name: 'minimum_order_amount' })
  minimumOrderAmount?: number;

  /** Ngày bắt đầu */
  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @IsISO8601()
  @Expose({ name: 'starts_at' })
  startsAt?: string;

  /** Giới hạn số lượng mã */
  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @IsNumber()
  @Expose({ name: 'usage_limit' })
  usageLimit?: number;

  /** Giá trị chiết khấu. Nếu giảm giá loại là "vận chuyển". Giá trị sẽ là phí vận chuyển. Nó phải được giới hạn ở mức phí vận chuyển áp dụng. */
  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @IsNumber()
  value?: number;

  @ApiPropertyOptional({
    enum: ECouponDiscountType,
  })
  @IsOptional()
  @IsDefined()
  @IsEnum(ECouponDiscountType)
  @Expose({ name: 'discount_type' })
  discountType?: ECouponDiscountType;

  @ApiPropertyOptional({ type: () => HaravanCouponVariantDto, isArray: true })
  @IsOptional()
  @IsDefined()
  @IsArray()
  @ValidateNested()
  @Type(() => HaravanCouponVariantDto)
  variants?: HaravanCouponVariantDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @IsDefined()
  @Expose({ name: 'set_time_active' })
  setTimeActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @IsNumber()
  @Expose({ name: 'applies_customer_group_id' })
  appliesCustomerGroupId?: number;

  @ApiPropertyOptional({ type: () => Number, isArray: true })
  @IsOptional()
  @IsDefined()
  @IsArray()
  @Expose({ name: 'location_ids' })
  locationIds?: number[];

  status?: string;

  @Expose({ name: 'times_used' })
  timesUsed?: number;

  @Expose({ name: 'create_user' })
  createUser?: number;

  @Expose({ name: 'first_name' })
  firstName?: string;

  @Expose({ name: 'last_name' })
  lastName?: string;

  @Expose({ name: 'created_at' })
  createdAt?: string;

  @Expose({ name: 'updated_at' })
  updatedAt?: string;

  @Expose({ name: 'promotion_apply_type' })
  promotionApplyType?: number;

  @Expose({ name: 'applies_to_quantity' })
  appliesToQuantity?: number;

  @Expose({ name: 'order_over' })
  orderOver?: string;

  @Expose({ name: 'is_new_coupon' })
  isNewCoupon?: boolean;

  channel?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDefined()
  @IsNumber()
  @Expose({ name: 'max_amount_apply' })
  maxAmountApply?: number;

  @Expose({ name: 'is_advance_same_price_discount' })
  isAdvanceSamePriceDiscount?: boolean;

  @Expose({ name: 'advance_same_prices' })
  advanceSamePrices?: string;

  @Expose({ name: 'products_selection' })
  productsSelection?: string;

  @Expose({ name: 'customers_selection' })
  customersSelection?: string;

  @Expose({ name: 'provinces_selection' })
  provincesSelection?: string;

  @Expose({ name: 'channels_selection' })
  channelsSelection?: string;

  @Expose({ name: 'locations_selection' })
  locationsSelection?: string;

  @Expose({ name: 'entitled_collection_ids' })
  entitledCollectionIds?: number[];

  @Expose({ name: 'entitled_product_ids' })
  entitledProductIds?: number[];

  @Expose({ name: 'entitled_variant_ids' })
  entitledVariantIds?: number[];

  @Expose({ name: 'entitled_customer_ids' })
  entitledCustomerIds?: number[];

  @Expose({ name: 'entitled_customer_segment_ids' })
  entitledCustomerSegmentIds?: number[];

  @Expose({ name: 'entitled_province_ids' })
  entitledProvinceIds?: number[];

  @Expose({ name: 'entitled_channels' })
  entitledChannels?: number[];

  @Expose({ name: 'entitled_location_ids' })
  entitledLocationIds?: number[];

  @Expose({ name: 'rule_customs' })
  ruleCustoms?: number[];

  @Expose({ name: 'take_type' })
  takeType?: string;
}
