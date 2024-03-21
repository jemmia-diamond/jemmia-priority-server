export class CustomerConfig {
  static customerA = {
    receiveRankPoint: 100,
    name: 'Partner A',
    percent: 0.5,
  };
  static customerB = {
    receiveRankPoint: 200,
    name: 'Partner B',
    percent: 0.7,
  };
  static partnerCoupon = {
    minimumOrderAmount: 0,
    usageLimit: 1,
    value: 100,
    discountType: 'percentage',
  };
}
