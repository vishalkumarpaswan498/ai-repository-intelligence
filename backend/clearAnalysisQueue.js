import IORedis from "ioredis";
import { Queue } from "bullmq";

const connection = new IORedis({
  host: "127.0.0.1",
  port: 6379,
  maxRetriesPerRequest: null,
});

const queue = new Queue(
  "repository-analysis",
  {
    connection,
  }
);

await queue.obliterate({
  force: true,
});

console.log(
  "✅ Repository analysis queue cleared successfully."
);

await queue.close();
await connection.quit();