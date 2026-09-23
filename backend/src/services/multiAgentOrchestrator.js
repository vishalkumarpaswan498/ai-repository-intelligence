// Multi-Agent Orchestrator
//
// Combines results from all software engineering agents
// and calculates an overall repository health score.

const severityWeights = {
  low: 2,
  medium: 5,
  high: 10,
  critical: 20,
};

// Calculate score for one agent
const calculateAgentScore = (agent) => {
  let penalty = 0;

  for (const issue of agent.results || []) {
    const severity =
      issue.severity?.toLowerCase() || "low";

    penalty +=
      severityWeights[severity] || 2;
  }

  // Prevent negative score
  return Math.max(0, 100 - penalty);
};

// Calculate overall repository health
const calculateHealthScore = (agents) => {
  const agentScores = {
    bugDetection:
      calculateAgentScore(
        agents.bugDetection
      ),

    security:
      calculateAgentScore(
        agents.security
      ),

    codeReview:
      calculateAgentScore(
        agents.codeReview
      ),

    testing:
      calculateAgentScore(
        agents.testing
      ),
  };

  const scores = Object.values(agentScores);

  const overallScore =
    scores.reduce(
      (sum, score) => sum + score,
      0
    ) / scores.length;

  return {
    overall: Math.round(overallScore),

    agents: agentScores,
  };
};

// Determine repository risk
const determineRiskLevel = (
  healthScore,
  agents
) => {
  const allIssues = Object.values(agents)
    .flatMap(
      (agent) => agent.results || []
    );

  const hasCriticalIssue =
    allIssues.some(
      (issue) =>
        issue.severity === "critical"
    );

  const hasHighIssue =
    allIssues.some(
      (issue) =>
        issue.severity === "high"
    );

  if (hasCriticalIssue) {
    return "critical";
  }

  if (hasHighIssue || healthScore < 50) {
    return "high";
  }

  if (healthScore < 75) {
    return "medium";
  }

  return "low";
};

// Generate summary
const generateSummary = (
  healthScore,
  riskLevel,
  agents
) => {
  // Total issues
  const totalIssues =
    Object.values(agents).reduce(
      (total, agent) =>
        total +
        (agent.issuesFound || 0),
      0
    );

  // Find which agent found the most issues
  const agentEntries = [
    {
      name: "Bug Detection",
      issues:
        agents.bugDetection?.issuesFound || 0,
    },
    {
      name: "Security Analysis",
      issues:
        agents.security?.issuesFound || 0,
    },
    {
      name: "Code Quality",
      issues:
        agents.codeReview?.issuesFound || 0,
    },
    {
      name: "Testing Analysis",
      issues:
        agents.testing?.issuesFound || 0,
    },
  ];

  const highestIssueAgent =
    agentEntries.reduce(
      (highest, agent) =>
        agent.issues > highest.issues
          ? agent
          : highest
    );

  // Count severity levels
  const severityCounts = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  };

  Object.values(agents).forEach(
    (agent) => {
      (agent.results || []).forEach(
        (issue) => {
          const severity =
            issue.severity?.toLowerCase();

          if (
            severity &&
            severityCounts[
              severity
            ] !== undefined
          ) {
            severityCounts[severity]++;
          }
        }
      );
    }
  );

  // Generate intelligent summary message
  let message = "";

  if (totalIssues === 0) {
    message =
      `The repository analysis is complete with a health score of ${healthScore}/100. ` +
      `No significant issues were detected across bug detection, security, code quality, or testing analysis. ` +
      `The repository currently appears to be in good condition.`;
  } else {
    message =
      `The repository has a health score of ${healthScore}/100 and is currently classified as ${riskLevel} risk. `;

    message +=
      `${totalIssues} potential issue(s) were detected across the repository. `;

    if (
      highestIssueAgent &&
      highestIssueAgent.issues > 0
    ) {
      message +=
        `${highestIssueAgent.name} identified the highest number of issues (${highestIssueAgent.issues}), making it the primary area requiring attention. `;
    }

    if (severityCounts.critical > 0) {
      message +=
        `${severityCounts.critical} critical issue(s) require immediate attention before production deployment. `;
    }

    if (severityCounts.high > 0) {
      message +=
        `${severityCounts.high} high-severity issue(s) should be prioritized for resolution. `;
    }

    if (severityCounts.medium > 0) {
      message +=
        `${severityCounts.medium} medium-severity issue(s) may affect code reliability and maintainability. `;
    }

    if (severityCounts.low > 0) {
      message +=
        `${severityCounts.low} low-severity issue(s) were also identified and can be addressed during regular maintenance. `;
    }

    // Final recommendation
    if (
      riskLevel === "critical" ||
      riskLevel === "high"
    ) {
      message +=
        "It is recommended to resolve critical and high-priority issues before deploying the repository to production.";
    } else if (riskLevel === "medium") {
      message +=
        "The repository is functional, but resolving the identified issues will improve reliability, maintainability, and long-term code quality.";
    } else {
      message +=
        "The repository appears relatively stable, with only minor improvements recommended.";
    }
  }

  return {
    totalIssues,

    healthScore,

    riskLevel,

    severityCounts,

    highestIssueAgent,

    message,
  };
};


// Run orchestrator
export const runMultiAgentOrchestrator = (
  agents
) => {
  // Calculate health score
  const health =
    calculateHealthScore(agents);

  // Calculate repository risk
  const riskLevel =
    determineRiskLevel(
      health.overall,
      agents
    );

  // Generate AI summary
  const summary =
    generateSummary(
      health.overall,
      riskLevel,
      agents
    );

  return {
    healthScore:
      health.overall,

    riskLevel,

    agentScores:
      health.agents,

    summary,

    severityCounts:
      summary.severityCounts,

    agents,
  };
};