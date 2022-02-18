import initializeDB, { // getDB
} from '../utils/mongo'
import { //getStatsCollectionName,
  loadArgsAndEnv } from '../utils'
import console from 'console'
import { getBlocksDb, updateBlocksToLatest } from '../utils/blocks'

loadArgsAndEnv(process.argv)

// const CLEAR_OLD = false;
const NETWORK = 'mainnet-ovm';

async function cacheBlocksAndTimestamps() {
  const startTime = Date.now()
  await initializeDB()

  let blocksDb = getBlocksDb(NETWORK)
  await updateBlocksToLatest(blocksDb, NETWORK)
  let res = blocksDb.prepare('SELECT blockNumber, timestamp FROM blockNums').all()
  const first = res[0];
  const latest = res[res.length-1];
  console.log(res[0])

  console.log(`Cached blocks: ${first} - ${latest} Done in ${(Date.now() - startTime) / 1000} sec`)
}

cacheBlocksAndTimestamps()
  .then(() => {
    console.log('Success')
    process.exit(0)
  })
  .catch(e => {
    console.log(e)
    console.log('Fail')
    process.exit(1)
  })
