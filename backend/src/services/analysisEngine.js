import { getGitHubRepository } from "./githubService.js";
import { scanRepository } from "./repositoryScannerService.js";
import { analyzeRepositoryFiles } from "./staticAnalysisService.js";

import { runBugDetectionAgent } from "./agents/bugDetectionAgent.js";
import { runSecurityAgent } from "./agents/securityAgent.js";
import { runCodeReviewAgent } from "./agents/codeReviewAgent.js";
import { runTestingAgent } from "./agents/testingAgent.js";

import { runMultiAgentOrchestrator } from "./multiAgentOrchestrator.js";

export const runRepositoryAnalysis = async (
  repository,
  repositoryPath
) => {
  try {
    console.log(
      `Starting analysis for: ${repository.name}`
    );

    // --------------------------------
    // 1. GitHub Metadata
    // --------------------------------

    console.time("1-GitHub Metadata");

    const githubRepository =
      await getGitHubRepository(
        repository.githubUrl
      );

    console.timeEnd("1-GitHub Metadata");

    console.log(
      `GitHub repository found: ${githubRepository.name}`
    );

    // --------------------------------
    // 2. Repository Scan
    // --------------------------------

    console.time("2-Repository Scan");

    const scannedRepository =
      await scanRepository(
        repositoryPath
      );

    console.timeEnd("2-Repository Scan");

    console.log(
      `Files scanned: ${scannedRepository.totalScannedFiles}`
    );

    // --------------------------------
    // 3. Static Analysis
    // --------------------------------

    console.time("3-Static Analysis");

    const staticAnalysis =
      analyzeRepositoryFiles(
        scannedRepository.files
      );

    console.timeEnd("3-Static Analysis");

    // --------------------------------
    // 4. AI Agents - Parallel
    // --------------------------------

    console.time("4-Parallel Agents");

    const [
      bugDetection,
      security,
      codeReview,
      testing,
    ] = await Promise.all([
      Promise.resolve(
        runBugDetectionAgent(
          scannedRepository.files
        )
      ),

      Promise.resolve(
        runSecurityAgent(
          scannedRepository.files
        )
      ),

      Promise.resolve(
        runCodeReviewAgent(
          scannedRepository.files
        )
      ),

      Promise.resolve(
        runTestingAgent(
          scannedRepository.files
        )
      ),
    ]);

    console.timeEnd("4-Parallel Agents");

    // --------------------------------
    // 5. Multi-Agent Orchestrator
    // --------------------------------

    console.time("5-Orchestrator");

    const orchestration =
      runMultiAgentOrchestrator({
        bugDetection,
        security,
        codeReview,
        testing,
      });

    console.timeEnd("5-Orchestrator");

    // --------------------------------
    // Results
    // --------------------------------

    console.log(
      `Overall Health Score: ${orchestration.healthScore}`
    );

    console.log(
      `Risk Level: ${orchestration.riskLevel}`
    );

    return {
      repository: {
        name: githubRepository.name,
        owner: githubRepository.owner,
        language: githubRepository.language,
        defaultBranch:
          githubRepository.defaultBranch,
      },

      files: {
        totalRepositoryFiles:
          scannedRepository.totalRepositoryFiles,

        totalAnalyzableFiles:
          scannedRepository.totalAnalyzableFiles,

        totalScannedFiles:
          scannedRepository.totalScannedFiles,
      },

      staticAnalysis,

      agents: {
        bugDetection,
        security,
        codeReview,
        testing,
      },

      orchestration,
    };

  } catch (error) {
    console.error(
      "Repository Analysis Engine Error:",
      error
    );

    throw error;
  }
};