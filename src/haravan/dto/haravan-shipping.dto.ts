import { Expose, Type } from 'class-transformer';

export class HaravanCountryDto {
  @Expose({ name: 'carrier_shipping_rate_providers' })
  carrierShippingRateProvider?: string;

  code: string;
  id: number;
  name: string;

  @Expose({ name: 'price_based_shipping_rates' })
  priceBasedShippingRates?: number;

  @Type(() => HaravanProvinceDto)
  provinces: HaravanProvinceDto[];

  tax?: string;

  @Expose({ name: 'weight_based_shipping_rates' })
  weightBasedShippingRates?: string;
}

export class HaravanProvinceDto {
  code: string;

  @Expose({ name: 'country_id' })
  countryId: number;

  id: number;
  name: string;
  tax?: string;

  @Expose({ name: 'tax_name' })
  taxName?: string;

  @Expose({ name: 'tax_type' })
  taxType?: string;

  @Expose({ name: 'tax_percentage' })
  taxPercentage?: string;
}

export class HaravanDistrictDto {
  code: string;

  @Expose({ name: 'province_id' })
  provinceId: number;

  id: number;
  name: string;
}

export class HaravanWardDto {
  code: string;

  @Expose({ name: 'district_id' })
  districtId: number;

  id: number;
  name: string;
}
