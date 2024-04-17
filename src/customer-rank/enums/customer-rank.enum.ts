export enum ECustomerRank {
  platinum = 'platinum',
  gold = 'gold',
  silver = 'silver',
  staff = 'staff',
  none = 'none',
}

export enum ECustomerRankCrm {
  '658d1cf71714e07bec045e17' = 'gold',
  '658d1cf71714e07bec045e16' = 'silver',
}

export enum ECustomerRankNum {
  platinum = 4,
  gold = 3,
  silver = 2,
  staff = 1,
  none = 0,
}

export const ECustomerRankConfig = {
  [ECustomerRank.platinum]: {
    buyPoint: 1_000_000_000,
    refPoint: 2_000_000_000,
  },
  [ECustomerRank.gold]: {
    buyPoint: 300_000_000,
    refPoint: 500_000_000,
  },
  [ECustomerRank.silver]: {
    buyPoint: 1,
    refPoint: 1,
  },
  [ECustomerRank.staff]: {
    buyPoint: -1,
    refPoint: -1,
  },
  [ECustomerRank.none]: {
    buyPoint: 0,
    refPoint: 0,
  },
};
