import dns from "node:dns";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { Worker } from "bullmq";
import IORedis from "ioredis";

import Repository from "../models/Repository.js";
import Analysis from "../models/Analysis.js";

import connectDB from "../config/db.js";

import {
  runRepositoryAnalysis,
} from "../services/analysisEngine.js";

import {
  cloneRepository,
  cleanupRepository,
} from "../services/githubService.js";

// ======================================================
// DNS
// ======================================================

dns.setServers(["8.8.8.8", "1.1.1.1"]);

// ======================================================
// Environment variables
// ======================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

console.log(
  "MONGO_URI loaded:",
  !!process.env.MONGO_URI
);

// ======================================================
// Redis connection
// ======================================================

const connection = new IORedis({
  host: "127.0.0.1",
  port: 6379,
  maxRetriesPerRequest: null,
});

connection.on("connect", () => {
  console.log("✅ Redis connected");
});

connection.on("ready", () => {
  console.log("✅ Redis ready");
});

connection.on("error", (error) => {
  console.error(
    "❌ Redis error:",
    error.message
  );
});

connection.on("close", () => {
  console.log(
    "⚠️ Redis connection closed"
  );
});

// ======================================================
// MongoDB
// ======================================================

await connectDB();

// ======================================================
// BullMQ Worker
// ======================================================

const worker = new Worker(
  "repository-analysis",

  async (job) => {
    const {
      repositoryId,
      analysisId,
    } = job.data;

    console.log(
      `\n🔥 Starting analysis job: ${job.id}`
    );

    console.log(
      `Repository ID: ${repositoryId}`
    );

    console.log(
      `Analysis ID: ${analysisId}`
    );

    // ==================================================
    // 1. Find repository
    // ==================================================

    const repository =
      await Repository.findById(
        repositoryId
      );

    if (!repository) {
      console.error(
        `❌ Repository not found for ID: ${repositoryId}`
      );

      throw new Error(
        `Repository not found: ${repositoryId}`
      );
    }

    console.log(
      `✅ Repository found: ${repository.name}`
    );

    console.log(
      `GitHub URL: ${repository.githubUrl}`
    );

    // ==================================================
    // 2. Find analysis
    // ==================================================

    const analysis =
      await Analysis.findById(
        analysisId
      );

    if (!analysis) {
      console.error(
        `❌ Analysis not found for ID: ${analysisId}`
      );

      throw new Error(
        `Analysis not found: ${analysisId}`
      );
    }

    console.log(
      `✅ Analysis record found: ${analysis._id}`
    );

    // ==================================================
    // 3. Mark analysis as analyzing
    // ==================================================

    analysis.status = "analyzing";

    await analysis.save();

    repository.analysisStatus =
      "analyzing";

    await repository.save();

    console.log(
      "🔍 Analysis status changed to ANALYZING"
    );

    let repositoryPath = null;

    try {
      // ==================================================
      // 4. Clone GitHub repository
      // ==================================================

      console.time(
        "⏱️ GitHub Clone"
      );

      repositoryPath =
        await cloneRepository(
          repository.githubUrl
        );

      console.timeEnd(
        "⏱️ GitHub Clone"
      );

      console.log(
        `📁 Repository available at: ${repositoryPath}`
      );

      // ==================================================
      // 5. Run complete repository analysis
      // ==================================================

      console.time(
        "⏱️ Complete Repository Analysis"
      );

      const result =
        await runRepositoryAnalysis(
          repository,
          repositoryPath
        );

      console.timeEnd(
        "⏱️ Complete Repository Analysis"
      );

      console.log(
        "✅ Repository analysis completed"
      );

      // ==================================================
      // 6. Save static analysis metrics
      // ==================================================

      analysis.metrics = {
        totalFiles:
          result.staticAnalysis?.summary
            ?.totalFiles || 0,

        totalLines:
          result.staticAnalysis?.summary
            ?.totalLines || 0,

        totalFunctions:
          result.staticAnalysis?.summary
            ?.totalFunctions || 0,

        totalImports:
          result.staticAnalysis?.summary
            ?.totalImports || 0,

        totalExports:
          result.staticAnalysis?.summary
            ?.totalExports || 0,

        totalClasses:
          result.staticAnalysis?.summary
            ?.totalClasses || 0,

        totalSize:
          result.staticAnalysis?.summary
            ?.totalSize || 0,
      };

      console.log(
        "📊 Analysis metrics:",
        analysis.metrics
      );

      // ==================================================
      // 7. Save agent results
      // ==================================================

      analysis.agents =
        result.agents;

      // ==================================================
      // 8. Save health score
      // ==================================================

      analysis.healthScore =
        result.orchestration
          ?.healthScore || 0;

      // ==================================================
      // 9. Save risk level
      // ==================================================

      analysis.riskLevel =
        result.orchestration
          ?.riskLevel || "unknown";

      // ==================================================
      // 10. Save severity counts
      // ==================================================

      analysis.severityCounts =
        result.orchestration
          ?.summary
          ?.severityCounts || {};

      // ==================================================
      // 11. Save summary
      // ==================================================

      analysis.summary =
        result.orchestration
          ?.summary
          ?.message || "";

      // ==================================================
      // 12. Mark analysis completed
      // ==================================================

      analysis.status =
        "completed";

      analysis.completedAt =
        new Date();

      await analysis.save();

      console.log(
        "✅ Analysis record saved successfully"
      );

      // ==================================================
      // 13. Update repository
      // ==================================================

      repository.analysisStatus =
        "completed";

      repository.healthScore =
        result.orchestration
          ?.healthScore || 0;

      repository.lastAnalyzed =
        new Date();

      await repository.save();

      console.log(
        `🎉 Analysis completed for: ${repository.name}`
      );

      console.log(
        `🏆 Health Score: ${repository.healthScore}`
      );

      console.log(
        `⚠️ Risk Level: ${analysis.riskLevel}`
      );

      // ==================================================
      // 14. Return BullMQ result
      // ==================================================

      return {
        success: true,

        repositoryId:
          repository._id.toString(),

        analysisId:
          analysis._id.toString(),

        healthScore:
          result.orchestration
            ?.healthScore || 0,

        riskLevel:
          result.orchestration
            ?.riskLevel || "unknown",

        metrics:
          analysis.metrics,
      };
    } catch (error) {
      // ==================================================
      // Analysis failed
      // ==================================================

      console.error(
        "\n❌ Analysis Worker Error:"
      );

      console.error(
        error
      );

      try {
        analysis.status =
          "failed";

        await analysis.save();
      } catch (saveError) {
        console.error(
          "❌ Could not update analysis status:",
          saveError.message
        );
      }

      try {
        repository.analysisStatus =
          "failed";

        await repository.save();
      } catch (saveError) {
        console.error(
          "❌ Could not update repository status:",
          saveError.message
        );
      }

      throw error;
    } finally {
      // ==================================================
      // Cleanup cloned repository
      // ==================================================

      if (repositoryPath) {
        try {
          await cleanupRepository(
            repositoryPath
          );

          console.log(
            "🧹 Temporary repository cleanup completed"
          );
        } catch (cleanupError) {
          console.error(
            "❌ Repository cleanup failed:",
            cleanupError.message
          );
        }
      }
    }
  },

  {
    connection,

    // Maximum 2 analysis jobs simultaneously
    concurrency: 2,
  }
);

// ======================================================
// Worker events
// ======================================================

worker.on("ready", () => {
  console.log(
    "✅ BullMQ Worker ready and waiting for jobs"
  );
});

worker.on("active", (job) => {
  console.log(
    `🔥 Job ${job.id} became ACTIVE`
  );
});

worker.on("stalled", (jobId) => {
  console.log(
    `⚠️ Job ${jobId} stalled`
  );
});

worker.on("error", (error) => {
  console.error(
    "❌ Worker error:",
    error
  );
});

worker.on(
  "completed",
  (job, result) => {
    console.log(
      `\n🟢 Job ${job.id} completed`
    );

    console.log(
      "Result:",
      result
    );
  }
);

worker.on(
  "failed",
  (job, error) => {
    console.error(
      `\n🔴 Job ${job?.id} failed:`,
      error.message
    );
  }
);

// ======================================================
// Start message
// ======================================================

console.log(
  "🚀 Analysis Worker is running..."
);