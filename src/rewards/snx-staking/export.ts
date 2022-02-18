import objectsToCsv from "objects-to-csv";
import CONFIG from "./config";
import getSNXStakingRewards from "./getSNXStakingRewards";

const OUT_FILE = "./out/snx-staking.csv";

export default async function updateSNXStakingRewards() {
  const statsPerUser = await getSNXStakingRewards(CONFIG);
  console.log("- Exporting", Object.keys(statsPerUser).length, "stakers");

  const rows = Object.values(statsPerUser).map(({ ...stats }) => {
    return {
      ...stats,
    };
  });

  const csv = new objectsToCsv(rows);
  await csv.toDisk(OUT_FILE, { allColumns: true });

  console.log("-- Exported to", OUT_FILE);
}
