// Code Review Agent
//
// Detects common code-quality and maintainability issues.
// Later this agent will use AI to perform deeper code review.

const reviewPatterns = [
  {
    name: "Very Long File",
    check: (content) => {
      const lines = content.split(/\r?\n/).length;
      return lines > 500;
    },
    severity: "medium",
    message:
      "File is very large and may be difficult to maintain. Consider splitting it into smaller modules.",
  },

  {
    name: "Very Long Function",
    check: (content) => {
      const lines = content.split(/\r?\n/);

      let functionStart = -1;
      let braceCount = 0;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (
          /\bfunction\b/.test(line) ||
          /=>\s*\{/.test(line)
        ) {
          functionStart = i;
          braceCount = 0;
        }

        if (functionStart !== -1) {
          braceCount +=
            (line.match(/\{/g) || []).length;

          braceCount -=
            (line.match(/\}/g) || []).length;

          if (
            braceCount <= 0 &&
            i - functionStart > 100
          ) {
            return true;
          }
        }
      }

      return false;
    },
    severity: "medium",
    message:
      "Function appears to be very long. Consider breaking it into smaller functions.",
  },

  {
    name: "Too Many Console Statements",
    check: (content) => {
      const matches = content.match(
        /\bconsole\.(log|error|warn|debug)\s*\(/g
      );

      return matches && matches.length > 10;
    },
    severity: "low",
    message:
      "Many console statements were found. Consider using a structured logging system.",
  },

  {
    name: "Commented Out Code",
    check: (content) => {
      const lines = content.split(/\r?\n/);

      let commentedCodeLines = 0;

      for (const line of lines) {
        if (
          /^\s*\/\/\s*(const|let|var|if|for|while|return|import|export)\b/.test(
            line
          )
        ) {
          commentedCodeLines++;
        }
      }

      return commentedCodeLines >= 3;
    },
    severity: "low",
    message:
      "Multiple lines of commented-out code detected. Remove obsolete code or keep it under version control.",
  },
];

// Analyze a single file
export const analyzeFileForCodeReview = (
  file
) => {
  const results = [];

  const content = file.content || "";

  for (const reviewPattern of reviewPatterns) {
    const found = reviewPattern.check(content);

    if (found) {
      results.push({
        file: file.path,
        issue: reviewPattern.name,
        severity: reviewPattern.severity,
        message: reviewPattern.message,
      });
    }
  }

  return results;
};

// Analyze complete repository
export const runCodeReviewAgent = (files) => {
  const results = [];

  for (const file of files) {
    const fileResults =
      analyzeFileForCodeReview(file);

    results.push(...fileResults);
  }

  return {
    status: "completed",
    issuesFound: results.length,
    results,
  };
};