import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { Queue } from "bullmq";
import IORedis from "ioredis";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

const connection = new IORedis({
  host: "127.0.0.1",
  port: 6379,
  maxRetriesPerRequest: null,
});

const analysisQueue = new Queue(
  "repository-analysis",
  {
    connection,
  }
);

const failedJobs = await analysisQueue.getFailed(
  0,
  50
);

console.log("\n❌ FAILED JOBS\n");

for (const job of failedJobs) {
  console.log("====================================");

  console.log("Job ID:", job.id);

  console.log("Job Name:", job.name);

  console.log("Data:", job.data);

  console.log(
    "Failed Reason:",
    job.failedReason
  );

  console.log(
    "Stacktrace:",
    job.stacktrace
  );

  console.log("====================================\n");
}

await connection.quit();
process.exit(0);