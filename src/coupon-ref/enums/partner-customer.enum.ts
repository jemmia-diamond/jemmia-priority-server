import {
  ECustomerRank,
  ECustomerRankConfig,
  ECustomerRankNum,
} from '../../customer-rank/enums/customer-rank.enum';
import { ECouponDiscountType } from '../../haravan/enums/coupon.enum';
import { EUserRole } from '../../user/enums/user-role.enum';

export const EPartnerCashbackConfig = {
  partnerRefferalCashbackPercent: {
    [EUserRole.partnerA]: {
      [EUserRole.partnerB]: 0.015,
    },
  },
  refferalCashbackPercent: {
    [ECustomerRank.platinum]: 0.035,
    [ECustomerRank.gold]: 0.025,
    [ECustomerRank.silver]: 0.015,
    [ECustomerRank.staff]: 0.02,
    [ECustomerRank.none]: 0,
  },
  firstBuyCashbackPercent: {
    [EUserRole.customer]: 1,
    [EUserRole.staff]: 1,
    [EUserRole.partnerA]: 8,
    [EUserRole.partnerB]: 6,
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
  receiveRank: ECustomerRankNum;
};

export const EPartnerInviteCouponConfig: {
  partnerA: CouponConfig;
  partnerB: CouponConfig;
} = {
  [EUserRole.partnerA]: {
    minimumOrderAmount: null,
    usageLimit: null,
    value: 100,
    discountType: ECouponDiscountType.percentage,
    receiveRankPoint: ECustomerRankConfig.platinum.buyPoint,
    receiveRank: ECustomerRankNum.platinum,
  },
  [EUserRole.partnerB]: {
    minimumOrderAmount: null,
    usageLimit: null,
    value: 100,
    discountType: ECouponDiscountType.percentage,
    receiveRankPoint: ECustomerRankConfig.gold.buyPoint,
    receiveRank: ECustomerRankNum.gold,
  },
};
