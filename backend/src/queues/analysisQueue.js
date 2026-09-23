import { Queue } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis({
  host: "127.0.0.1",
  port: 6379,
  maxRetriesPerRequest: null,
});

connection.on("connect", () => {
  console.log("✅ Analysis Queue Redis connected");
});

connection.on("ready", () => {
  console.log("✅ Analysis Queue Redis ready");
});

connection.on("error", (error) => {
  console.error(
    "❌ Analysis Queue Redis error:",
    error.message
  );
});

export const analysisQueue = new Queue(
  "repository-analysis",
  {
    connection,
  }
);

analysisQueue.on("error", (error) => {
  console.error(
    "❌ Analysis Queue error:",
    error.message
  );
});