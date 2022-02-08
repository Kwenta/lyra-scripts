import { Deployments } from "../../utils";

export type TradingRoundConfig = {
  leap: string;
  deployment: Deployments;
  roundMaxExpiryTimestamp: number;
  rewardCap: number;
  markets: Record<
    string,
    {
      longFeeRewardRate: number;
      shortFeeRewardRate: number;
      shortPutDailyRewardRate: number;
      shortCallDailyRewardRate: number;
    }
  >;
};

const CONFIG: TradingRoundConfig[] = [
  {
    leap: "leap8.1",
    deployment: "mainnet-ovm",
    roundMaxExpiryTimestamp: 1637308800,
    rewardCap: 800000,
    markets: {
      sETH: {
        longFeeRewardRate: 0.35,
        shortFeeRewardRate: 0.45,
        shortPutDailyRewardRate: 0.0120667,
        shortCallDailyRewardRate: 50.67,
      },
      sLINK: {
        longFeeRewardRate: 0.35,
        shortFeeRewardRate: 0.45,
        shortPutDailyRewardRate: 0.0116667,
        shortCallDailyRewardRate: 0.37,
      },
      sBTC: {
        longFeeRewardRate: 0.35,
        shortFeeRewardRate: 0.45,
        shortPutDailyRewardRate: 0.01216,
        shortCallDailyRewardRate: 711,
      },
    },
  },
  {
    leap: "leap8.2",
    deployment: "mainnet-ovm",
    roundMaxExpiryTimestamp: 1639123200,
    rewardCap: 1200000,
    markets: {
      sETH: {
        longFeeRewardRate: 0.35,
        shortFeeRewardRate: 0.45,
        shortPutDailyRewardRate: 0.005309915246,
        shortCallDailyRewardRate: 22.69457776,
      },
      sLINK: {
        longFeeRewardRate: 0.35,
        shortFeeRewardRate: 0.45,
        shortPutDailyRewardRate: 0.005438584699,
        shortCallDailyRewardRate: 0.1541838762,
      },
      sBTC: {
        longFeeRewardRate: 0.35,
        shortFeeRewardRate: 0.45,
        shortPutDailyRewardRate: 0.005191027026,
        shortCallDailyRewardRate: 300.5397007,
      },
    },
  },
  {
    leap: "leap8.3",
    deployment: "mainnet-ovm",
    roundMaxExpiryTimestamp: 1641542400,
    rewardCap: 1600000,
    markets: {
      sETH: {
        longFeeRewardRate: 0.35,
        shortFeeRewardRate: 0.45,
        shortPutDailyRewardRate: 0.004209956859,
        shortCallDailyRewardRate: 16.99138588,
      },
      sLINK: {
        longFeeRewardRate: 0.35,
        shortFeeRewardRate: 0.45,
        shortPutDailyRewardRate: 0.006602270569,
        shortCallDailyRewardRate: 0.1282160945,
      },
      sBTC: {
        longFeeRewardRate: 0.35,
        shortFeeRewardRate: 0.45,
        shortPutDailyRewardRate: 0.004497491673,
        shortCallDailyRewardRate: 217.156888,
      },
    },
  },
  {
    leap: "leap13.1",
    deployment: "mainnet-ovm",
    roundMaxExpiryTimestamp: 1643961600,
    rewardCap: 1333333.33,
    // TODO: change fee rates
    markets: {
      sETH: {
        longFeeRewardRate: 0.8,
        shortFeeRewardRate: 1,
        shortPutDailyRewardRate: 0.002215043839,
        shortCallDailyRewardRate: 7.121365944,
      },
      sLINK: {
        longFeeRewardRate: 0.8,
        shortFeeRewardRate: 1,
        shortPutDailyRewardRate: 0.002325412397,
        shortCallDailyRewardRate: 0.06185596977,
      },
      sBTC: {
        longFeeRewardRate: 0.8,
        shortFeeRewardRate: 1,
        shortPutDailyRewardRate: 0.002353633422,
        shortCallDailyRewardRate: 98.73492204,
      },
    },
  },
  {
    leap: 'leap13.2',
    deployment: 'mainnet-ovm',
    roundMaxExpiryTimestamp: 1646380800,
    rewardCap: 1333333.33,
    markets: {
      sETH: {
        longFeeRewardRate: 0.8,
        shortFeeRewardRate: 1,
        shortPutDailyRewardRate:0.002397133029,
        shortCallDailyRewardRate: 7.177016289,
      },
      sLINK: {
        longFeeRewardRate: 0.8,
        shortFeeRewardRate: 1,
        shortPutDailyRewardRate: 0.003034485793,
        shortCallDailyRewardRate: 0.05401384712,
      },
      sBTC: {
        longFeeRewardRate: 0.8,
        shortFeeRewardRate: 1,
        shortPutDailyRewardRate: 0.002479106401,
        shortCallDailyRewardRate: 102.635005,
      },
    },
  },
];

export default CONFIG;
