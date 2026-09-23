import IORedis from "ioredis";
import { Queue } from "bullmq";

const connection = new IORedis({
  host: "127.0.0.1",
  port: 6379,
  maxRetriesPerRequest: null,
});

const queue = new Queue("repository-analysis", {
  connection,
});

try {
  const jobs = await queue.getJobs(
    ["completed", "failed"],
    0,
    20,
    true
  );

  console.log("\n=================================");
  console.log("📋 RECENT ANALYSIS JOBS");
  console.log("=================================\n");

  for (const job of jobs) {
    const state = await job.getState();

    console.log("---------------------------------");
    console.log(`Job ID: ${job.id}`);
    console.log(`State: ${state}`);
    console.log(`Repository ID: ${job.data.repositoryId}`);
    console.log(`Analysis ID: ${job.data.analysisId}`);

    if (state === "failed") {
      console.log("❌ Failed Reason:");
      console.log(job.failedReason);
    }

    console.log(
      `Created: ${new Date(job.timestamp).toISOString()}`
    );

    if (job.finishedOn) {
      console.log(
        `Finished: ${new Date(job.finishedOn).toISOString()}`
      );
    }

    console.log("---------------------------------\n");
  }
} catch (error) {
  console.error("❌ Queue status error:", error);
} finally {
  await queue.close();
  await connection.quit();
}