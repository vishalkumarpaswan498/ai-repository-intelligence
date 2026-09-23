import IORedis from "ioredis";
import { Queue } from "bullmq";

const connection = new IORedis({
  host: "127.0.0.1",
  port: 6379,
  maxRetriesPerRequest: null,
});

const analysisQueue = new Queue("repository-analysis", {
  connection,
});

await analysisQueue.obliterate({
  force: true,
});

console.log("✅ Analysis queue completely cleared");

await connection.quit();