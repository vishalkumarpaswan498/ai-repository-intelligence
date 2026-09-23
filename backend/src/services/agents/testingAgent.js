// Testing Agent
//
// Detects basic testing-related issues.
// Later this agent can use AI to generate test cases
// and identify untested critical code paths.

const testExtensions = [
  ".test.js",
  ".test.jsx",
  ".test.ts",
  ".test.tsx",
  ".spec.js",
  ".spec.jsx",
  ".spec.ts",
  ".spec.tsx",
];

const isTestFile = (filePath) => {
  const lowerPath = filePath.toLowerCase();

  return testExtensions.some((extension) =>
    lowerPath.endsWith(extension)
  );
};

const isTestDirectory = (filePath) => {
  const lowerPath = filePath.toLowerCase();

  return (
    lowerPath.includes("/test/") ||
    lowerPath.includes("/tests/") ||
    lowerPath.includes("/__tests__/") ||
    lowerPath.startsWith("test/") ||
    lowerPath.startsWith("tests/")
  );
};

// Check whether repository contains tests
const detectTestFiles = (files) => {
  return files.filter(
    (file) =>
      isTestFile(file.path) ||
      isTestDirectory(file.path)
  );
};

// Detect potentially important source files without tests
const detectUntestedFiles = (
  sourceFiles,
  testFiles
) => {
  const testContent = testFiles
    .map((file) => file.content || "")
    .join("\n");

  const results = [];

  for (const file of sourceFiles) {
    if (
      file.path.includes("test") ||
      file.path.includes("spec")
    ) {
      continue;
    }

    const fileName =
      file.path.split("/").pop() || "";

    const baseName =
      fileName.replace(
        /\.(js|jsx|ts|tsx|py|java|cpp|c)$/i,
        ""
      );

    if (
      baseName.length > 0 &&
      !testContent.includes(baseName)
    ) {
      results.push({
        file: file.path,
        issue: "Potentially Untested File",
        severity: "medium",
        message:
          "No obvious test reference was found for this source file.",
      });
    }
  }

  return results;
};

// Run Testing Agent
export const runTestingAgent = (files) => {
  const testFiles = detectTestFiles(files);

  const sourceFiles = files.filter(
    (file) =>
      !isTestFile(file.path) &&
      !isTestDirectory(file.path)
  );

  const results = [];

  // No tests at all
  if (testFiles.length === 0) {
    results.push({
      issue: "No Test Files",
      severity: "high",
      message:
        "No test files were detected in the analyzed repository.",
    });
  } else {
    // Look for potentially untested source files
    const untestedFiles =
      detectUntestedFiles(
        sourceFiles,
        testFiles
      );

    results.push(...untestedFiles);
  }

  return {
    status: "completed",

    testFilesFound: testFiles.length,

    sourceFilesAnalyzed: sourceFiles.length,

    issuesFound: results.length,

    results,
  };
};