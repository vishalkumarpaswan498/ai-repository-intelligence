// Security Detection Agent
//
// Detects common security-sensitive patterns.
// Later this agent will be enhanced with AI-based security reasoning.

const securityPatterns = [
  {
    name: "Hardcoded Secret",
    pattern:
      /\b(?:api[_-]?key|secret|password|token|access[_-]?token)\s*[:=]\s*["'][^"']{8,}["']/gi,
    severity: "high",
    message:
      "Possible hardcoded credential or secret found in source code.",
  },

  {
    name: "Dangerous Eval",
    pattern: /\beval\s*\(/g,
    severity: "high",
    message:
      "eval() can execute dynamically generated code and may introduce security risks.",
  },

  {
    name: "Command Execution",
    pattern:
      /\b(?:exec|execSync|spawn|spawnSync)\s*\(/g,
    severity: "high",
    message:
      "Command execution API detected. User-controlled input must be validated carefully.",
  },

  {
    name: "InnerHTML Usage",
    pattern:
      /\.innerHTML\s*=/g,
    severity: "medium",
    message:
      "innerHTML usage can introduce XSS vulnerabilities when handling untrusted input.",
  },

  {
    name: "HTTP URL",
    pattern:
      /["']http:\/\/[^"']+["']/gi,
    severity: "low",
    message:
      "Non-HTTPS URL detected. Sensitive communication should use HTTPS.",
  },
];

// Analyze one file
export const analyzeFileForSecurity = (file) => {
  const results = [];

  const content = file.content || "";

  for (const securityPattern of securityPatterns) {
    const matches = [
      ...content.matchAll(securityPattern.pattern),
    ];

    for (const match of matches) {
      const beforeMatch = content.substring(
        0,
        match.index
      );

      const lineNumber =
        beforeMatch.split(/\r?\n/).length;

      results.push({
        file: file.path,
        line: lineNumber,
        issue: securityPattern.name,
        severity: securityPattern.severity,
        message: securityPattern.message,
      });
    }
  }

  return results;
};

// Analyze complete repository
export const runSecurityAgent = (files) => {
  const results = [];

  for (const file of files) {
    const fileResults =
      analyzeFileForSecurity(file);

    results.push(...fileResults);
  }

  return {
    status: "completed",
    issuesFound: results.length,
    results,
  };
};