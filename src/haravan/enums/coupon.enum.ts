export enum ECouponDiscountType {
  percentage = 'percentage',
  fixedAmount = 'fixed_amount',
  shipping = 'shipping',
}

/** Sản phẩm muốn áp dụng coupon */
export enum ECouponApplyResource {
  /** Áp dụng lên sản phẩm */
  product = 'product',

  /** Áp dụng dựa trên quận */
  province = 'province',

  /** Áp dụng dựa trên collection */
  collection = 'collection',

  /** Áp dụng dựa trên khách hàng */
  customer = 'customer',

  /** Áp dụng dựa trên group khách hàng */
  groupCustomer = 'group_customer',

  /** Áp dụng dựa trên biến thể sản phẩm */
  productVariant = 'product_variant',
}
