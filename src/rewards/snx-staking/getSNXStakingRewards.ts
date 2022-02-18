import getSNXDebtEpochs from './getSNXDebtEpochs'
import { SNXStakingConfig } from './config'
import { ethers } from 'ethers'

type SNXUserStats = {
  address: string
  totalDebt: number
  totalDebtShare: number
  mostRecentEpoch: number
  stakingRewards: number
  retroRewards: number
}

export default async function getSNXStakingRewards(params: SNXStakingConfig): Promise<Record<string, SNXUserStats>> {
  console.log('- Calculating epochs')

  const epochs = await getSNXDebtEpochs(params)

  // calculate the rewards each staker gets in the staking period
  const stakingRewardPerEpoch =
    params.stakingRewardAmount / ((params.stakingEndDate - params.stakingStartDate) / params.epochDuration)

  const debtTotals: Record<string, number> = {}
  const userDebtTotals: Record<string, Record<string, number>> = {}

  let previousDebtState = null
  let currentDebtState = null
  for (let epoch in epochs) {
    const debtSnapshots = epochs[epoch].snapshots
    currentDebtState = epochs[epoch].state
    if (!previousDebtState) {
      previousDebtState = currentDebtState
    }
    /*
      ***debtSnapshots {
        '0x828A30F9bfFf6726765b5C7eAc213B5Ad22fbFb8': {
          id: '0x94bd4b68746155b1a6824176c5d79258e40cc5ca680380f60365bb25a3b03273-2',
          block: 3107035,
          timestamp: 1633992583,
          account: '0x828a30f9bfff6726765b5c7eac213b5ad22fbfb8',
          balanceOf: 1658.8996661458589,
          collateral: 1757.0715413313342,
          debtBalanceOf: 2790.890846367308
        },
    */
    for (const addressRaw in debtSnapshots) {
      const address = ethers.utils.getAddress(addressRaw)
      const debtSnapshot = debtSnapshots[address]
      const userDebtTotal = (debtSnapshot.debtBalanceOf * previousDebtState.debtRatio) / currentDebtState.debtRatio
      userDebtTotals[address] = userDebtTotals[address] || {}
      userDebtTotals[address][epoch] = userDebtTotal
      if (debtTotals[epoch]) {
        debtTotals[epoch] += userDebtTotal
      } else {
        debtTotals[epoch] = userDebtTotal
      }
    }
    previousDebtState = currentDebtState
  }

  const statsPerUser: Record<string, SNXUserStats> = {}

  for (let address in userDebtTotals) {
    const userDebtTotalsAllEpochs = userDebtTotals[address]
    for (let epoch in userDebtTotalsAllEpochs) {
      const userDebtCurrentEpoch = userDebtTotalsAllEpochs[epoch]
      const totalDebt = debtTotals[epoch]
      const totalDebtShare = userDebtCurrentEpoch / totalDebt

      const isRetro = false;

      if (!statsPerUser[address]) {
        statsPerUser[address] = {
          address: address,
          mostRecentEpoch: parseInt(epoch),
          stakingRewards: 0,
          retroRewards: 0,
          totalDebt: 0,
          totalDebtShare: 0,
        }
      }

      const rewards = stakingRewardPerEpoch * totalDebtShare

      if (isRetro) {
        statsPerUser[address].retroRewards += rewards
      } else {
        statsPerUser[address].stakingRewards += rewards
      }
      statsPerUser[address].totalDebt = userDebtCurrentEpoch
      statsPerUser[address].totalDebtShare = totalDebtShare
      statsPerUser[address].mostRecentEpoch = parseInt(epoch)
    }
  }

  const totalStakingRewards = Object.values(statsPerUser).reduce((sum, stats) => stats.stakingRewards + sum, 0)

  console.log('- Staking')
  console.log('--', (params.stakingEndDate - params.stakingStartDate) / params.epochDuration, 'epochs')
  console.log('--', stakingRewardPerEpoch, 'kwenta per epoch')
  console.log('--', totalStakingRewards, '/', params.stakingRewardAmount, 'rewards distributed')

  return statsPerUser
}
