export type SNXStakingConfig = {
  // retroStartDate: number
  // retroEndDate: number
  // retroRewardAmount: number
  stakingStartDate: number
  stakingEndDate: number
  stakingRewardAmount: number
  // stakingEndBlock: number
  epochDuration: number
}
// https://kips.kwenta.io/kips/kip-10/ -- 112 epochs over 2 weeks
const CONFIG: SNXStakingConfig = {
  stakingStartDate: 1643155200, // GMT: Wednesday, January 26, 2022 12:00:00 AM
  stakingEndDate: 1644364800, // GMT: Wednesday, February 9, 2022 12:00:00 AM
  stakingRewardAmount: 696.38,
  epochDuration: 10800, // 3 hours
}

export default CONFIG
