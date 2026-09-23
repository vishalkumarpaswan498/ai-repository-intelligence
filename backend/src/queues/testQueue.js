import { analysisQueue } from "./analysisQueue.js";

const job = await analysisQueue.add(
  "repository-analysis",
  {
    repositoryId: "test-repository",
  }
);

console.log("Job added:", job.id);

process.exit(0);