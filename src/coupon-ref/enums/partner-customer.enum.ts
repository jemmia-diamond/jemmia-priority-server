import {
  ECustomerRank,
  ECustomerRankConfig,
} from '../../customer-rank/enums/customer-rank.enum';
import { ECouponDiscountType } from '../../haravan/enums/coupon.enum';

export enum EPartnerCustomer {
  partnerA = 'partnerA',
  partnerB = 'partnerB',
  customer = 'customer',
  staff = 'staff',
}

export const EPartnerCashbackConfig = {
  partnerRefferalCashbackPercent: {
    [EPartnerCustomer.partnerA]: {
      [EPartnerCustomer.partnerB]: 0.015,
    },
  },
  refferalCashbackPercent: {
    [ECustomerRank.platinum]: 0.04,
    [ECustomerRank.gold]: 0.025,
    [ECustomerRank.silver]: 0.015,
    [ECustomerRank.staff]: 0.02,
    [ECustomerRank.none]: 0,
  },
  firstBuyCashbackPercent: {
    [ECustomerRank.platinum]: {
      diamond: 0,
      box: 0,
      order: 0.01,
    },
    [ECustomerRank.gold]: {
      diamond: 0,
      box: 0,
      order: 0.01,
    },
    [ECustomerRank.silver]: {
      diamond: 0,
      box: 0,
      order: 0.01,
    },
    [ECustomerRank.none]: {
      diamond: 0,
      box: 0,
      order: 0.01,
    },
  },
  retensionBuyCashbackPercent: {
    [ECustomerRank.platinum]: {
      diamond: 0.02,
      box: 0.035,
      order: 0,
    },
    [ECustomerRank.gold]: {
      diamond: 0.01,
      box: 0.025,
      order: 0,
    },
    [ECustomerRank.silver]: {
      diamond: 0.005,
      box: 0.015,
      order: 0,
    },
    [ECustomerRank.none]: {
      diamond: 0,
      box: 0,
      order: 0,
    },
  },
};

type CouponConfig = {
  minimumOrderAmount?: number;
  usageLimit?: number;
  value: number;
  discountType: ECouponDiscountType;
  receiveRankPoint: number;
};

export const EPartnerInviteCouponConfig: {
  partnerA: CouponConfig;
  partnerB: CouponConfig;
} = {
  [EPartnerCustomer.partnerA]: {
    minimumOrderAmount: null,
    usageLimit: null,
    value: 100,
    discountType: ECouponDiscountType.percentage,
    receiveRankPoint: ECustomerRankConfig.platinum.buyPoint,
  },
  [EPartnerCustomer.partnerB]: {
    minimumOrderAmount: null,
    usageLimit: null,
    value: 100,
    discountType: ECouponDiscountType.percentage,
    receiveRankPoint: ECustomerRankConfig.gold.buyPoint,
  },
};
