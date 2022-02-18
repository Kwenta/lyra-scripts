// @ts-ignore:next-line
import sqlite3 from "better-sqlite3";
import axios from "axios";
import path from "path";
import { Deployments, getOVMRpcUrl } from "./index";
import { PRE_REGENESIS_ADD } from "./isPostRegenesis";
import console from "console";

export function getBlocksDb(network: string) {
  return sqlite3(
    path.join(__dirname, "../../data/", `${network}-blockNumbers.sqlite`)
  );
}

async function getBlockTimestamp(
  deployment: Deployments,
  isPostRegenesis: boolean,
  blockNumber: number | "latest"
): Promise<{ number: number, timestamp: number}> {
  let res;
  while (true) {
    const url = getOVMRpcUrl(deployment)

    try {
      res = await axios.post(url, {
        jsonrpc: "2.0",
        method: "eth_getBlockByNumber",
        params: [
          blockNumber == "latest" ? "latest" : "0x" + ( blockNumber - (isPostRegenesis ? 0 : PRE_REGENESIS_ADD)).toString(16),
          false,
        ],
        id: 1,
      });
      if (res.data.result) {
        const result = {
          number: parseInt(res.data.result.number, 16),
          timestamp: parseInt(res.data.result.timestamp, 16)
        }
        return result;
      }
    } catch {
      console.error(`-- fail fetching block ${blockNumber} timestamp, retrying. res.data:`, res?.data);
    }
  }
}

async function cacheBlockNumbers(
  blocksDb: any,
  isPostRegenesis: boolean,
  deployment: Deployments
) {
  await blocksDb.exec(`CREATE TABLE IF NOT EXISTS blockNums (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    blockNumber INTEGER NOT NULL,
    timestamp INTEGER NOT NULL
  )`);

  const insertStmt = blocksDb.prepare(
    "INSERT INTO blockNums (blockNumber, timestamp) VALUES (?, ?)"
  );
  const insertMany = blocksDb.transaction((blockData: any) => {
    for (const blockDatum of blockData) {
      const blockNumber = blockDatum.number;
      const blockTimestamp = blockDatum.timestamp;
      insertStmt.run(parseInt(blockNumber), blockTimestamp);
    }
  });

  let startBlock: number =
    (blocksDb
      .prepare("SELECT MAX(blockNumber) as maxBlock FROM blockNums")
      .get()?.maxBlock || 0) + 1;
  const maxBlockData = await getBlockTimestamp(
    deployment,
    isPostRegenesis,
    "latest" as any
  );

  console.log({ maxBlockData });

  if (startBlock < 0 && isPostRegenesis) {
    startBlock = 0;
  }

  console.log(`- Caching block timestamps: [${startBlock}-${maxBlockData.number}]`);

  if (Object.keys(maxBlockData).length === 0) {
    console.error('No timestamp nor blocknumber for maxBlock')
  }
  let endBlock = maxBlockData.number;
  const batchSize = 200;

  for (let i = startBlock; i < endBlock; i += batchSize) {
    console.log(`- ${i}/${endBlock}`);
    const promises = [];
    for (let j = i; j < i + batchSize; j++) {
      promises.push(getBlockTimestamp(deployment, isPostRegenesis, j));
    }
    const results = await Promise.all(promises);
    insertMany(results.filter((x) => x !== null));
  }
}

export async function getTimestampForBlock(
  blocksDb: sqlite3.Database,
  blockNumber: number
) {
  const res = blocksDb
    .prepare(
      "SELECT blockNumber, timestamp FROM blockNums WHERE blockNumber = ?"
    )
    .get(blockNumber);

  if (res.length == 0) {
    throw Error("missing timestamp for block " + blockNumber);
  }

  return res.timestamp;
}

export async function updateBlocksToLatest(
  blocksDb: any,
  deployment: Deployments
) {
  const isPostRegenesis = true;

  await cacheBlockNumbers(blocksDb, isPostRegenesis, deployment);

  return (
    blocksDb.prepare("SELECT MAX(blockNumber) as maxBlock FROM blockNums").get()
      ?.maxBlock || 0
  );
}

export async function updateBlocksToLatestAndGetAll(deployment: Deployments) {
  const network = deployment.split("-")[0];
  let blocksDb = getBlocksDb(network);

  await updateBlocksToLatest(blocksDb, deployment);
  return getAll(blocksDb);
}

export async function getAll(blocksDb: any) {
  let res = blocksDb
    .prepare("SELECT blockNumber, timestamp FROM blockNums")
    .all();
  let timestamps: any = {};
  res.forEach((x: any) => {
    timestamps[x.blockNumber] = x.timestamp;
  });
  return timestamps;
}

export async function getBlockEpochs(
  deployment: Deployments,
  startDate: number,
  endDate: number,
  epochDuration: number
) {
  const network = deployment.split("-")[0];
  const blocksDb = getBlocksDb(network);

  const epochs = [];

  let currentTimestamp = startDate;

  let res = blocksDb
    .prepare(
      "SELECT MIN(blockNumber) as minBlock, timestamp FROM blockNums WHERE timestamp > ?"
    )
    .get(currentTimestamp);
  let currentBlock = res.minBlock;
  let currentRealTimestamp = res.timestamp;

  while (currentTimestamp < endDate) {
    const nextTimestamp = currentTimestamp + epochDuration;

    res = blocksDb
      .prepare(
        "SELECT MIN(blockNumber) as minBlock, timestamp FROM blockNums WHERE timestamp > ?"
      )
      .get(nextTimestamp);

    if (res.minBlock === null) {
      epochs.push([
        [currentBlock, currentRealTimestamp],
        [null, nextTimestamp],
      ]);
      break;
    }

    epochs.push([
      [currentBlock, currentRealTimestamp],
      [res.minBlock - 1, res.timestamp],
    ]);

    currentTimestamp = nextTimestamp;
    currentBlock = res.minBlock;
    currentRealTimestamp = res.timestamp;
  }

  blocksDb.close();

  return epochs;
}
