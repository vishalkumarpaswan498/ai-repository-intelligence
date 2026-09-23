// Bug Detection Agent
//
// This agent currently performs basic static bug-pattern detection.
// Later, an AI model will analyze the same source code for deeper issues.

const bugPatterns = [
  {
    name: "Console Statement",

    pattern:
      /\bconsole\.(log|error|warn|debug)\s*\(/g,

    severity: "low",

    message:
      "Console statement found in source code.",

    suggestion:
      "Remove unnecessary console statements before production or replace them with a proper logging system.",
  },

  {
    name: "Empty Catch Block",

    pattern:
      /catch\s*\([^)]*\)\s*\{\s*\}/g,

    severity: "medium",

    message:
      "Empty catch block may hide runtime errors.",

    suggestion:
      "Handle the error properly inside the catch block or log the error for debugging.",
  },

  {
    name: "Debugger Statement",

    pattern:
      /\bdebugger\s*;/g,

    severity: "medium",

    message:
      "Debugger statement found in source code.",

    suggestion:
      "Remove the debugger statement before deploying the application.",
  },

  {
    name: "Hardcoded TODO",

    pattern: /\bTODO\b/g,

    severity: "low",

    message:
      "TODO marker indicates unfinished code.",

    suggestion:
      "Complete the pending implementation or convert the TODO into a tracked task.",
  },
];

// Analyze a single file
export const analyzeFileForBugs = (file) => {
const results = [];

const content = file.content || "";
const lines = content.split(/\r?\n/);

for (const bugPattern of bugPatterns) {
const matches = [...content.matchAll(bugPattern.pattern)];


for (const match of matches) {
  const beforeMatch = content.substring(
    0,
    match.index
  );

  const lineNumber =
    beforeMatch.split(/\r?\n/).length;

  const codeSnippet =
    lines[lineNumber - 1]?.trim() || "";

  results.push({
    file: file.path,

    line: lineNumber,

    code: codeSnippet,

    issue: bugPattern.name,

    severity: bugPattern.severity,

    message: bugPattern.message,

    suggestion:
      bugPattern.suggestion ||
      "Review this code and apply the appropriate fix.",
  });
}


}

return results;
};


// Analyze complete repository
export const runBugDetectionAgent = (files) => {
  const results = [];

  for (const file of files) {
    const fileResults = analyzeFileForBugs(file);

    results.push(...fileResults);
  }

  return {
    status: "completed",
    issuesFound: results.length,
    results,
  };
};