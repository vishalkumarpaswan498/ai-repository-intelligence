// Files that should not be analyzed
const ignoredDirectories = [
  "node_modules",
  ".git",
  "dist",
  "build",
  "coverage",
  ".next",
  "target",
  "bin",
  "obj",
];

// File extensions that can contain source/configuration code
const supportedExtensions = [
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".py",
  ".java",
  ".c",
  ".cpp",
  ".h",
  ".hpp",
  ".cs",
  ".go",
  ".rs",
  ".php",
  ".rb",
  ".kt",
  ".swift",
  ".html",
  ".css",
  ".scss",
  ".json",
  ".xml",
  ".yaml",
  ".yml",
  ".md",
];

// Check whether a file should be analyzed
export const isAnalyzableFile = (filePath) => {
  const normalizedPath = filePath.toLowerCase();

  // Ignore directories
  const hasIgnoredDirectory = ignoredDirectories.some(
    (directory) =>
      normalizedPath.includes(`/${directory}/`) ||
      normalizedPath.startsWith(`${directory}/`)
  );

  if (hasIgnoredDirectory) {
    return false;
  }

  // Check extension
  return supportedExtensions.some((extension) =>
    normalizedPath.endsWith(extension)
  );
};

// Filter repository files
export const selectAnalyzableFiles = (files) => {
  return files.filter((file) =>
    isAnalyzableFile(file.path)
  );
};

// Calculate basic repository statistics
export const calculateFileStatistics = (files) => {
  const statistics = {
    totalFiles: files.length,
    totalSize: 0,
    languages: {},
    extensions: {},
  };

  for (const file of files) {
    statistics.totalSize += file.size || 0;

    const fileName = file.path.split("/").pop() || "";

    const dotIndex = fileName.lastIndexOf(".");

    if (dotIndex !== -1) {
      const extension = fileName
        .substring(dotIndex)
        .toLowerCase();

      statistics.extensions[extension] =
        (statistics.extensions[extension] || 0) + 1;
    }
  }

  return statistics;
};