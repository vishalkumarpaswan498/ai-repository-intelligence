import fs from "node:fs/promises";
import path from "node:path";

import { selectAnalyzableFiles } from "./fileAnalysisService.js";

// Maximum number of files to scan
const MAX_FILES_TO_SCAN = 50;

// Maximum file size to analyze (100 KB)
const MAX_FILE_SIZE = 100 * 1024;

// Directories that should not be analyzed
const IGNORED_DIRECTORIES = new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  "coverage",
  ".next",
  ".vite",
  "vendor",
]);

// Recursively collect repository files
const collectFiles = async (
  directory,
  rootDirectory,
  files = []
) => {
  // Stop collecting once enough files are found.
  // This avoids unnecessary filesystem work.
  if (files.length >= MAX_FILES_TO_SCAN) {
    return files;
  }

  let entries;

  try {
    entries = await fs.readdir(directory, {
      withFileTypes: true,
    });
  } catch (error) {
    console.error(
      `Could not read directory ${directory}:`,
      error.message
    );

    return files;
  }

  for (const entry of entries) {
    // Stop as soon as the required number of files is reached
    if (files.length >= MAX_FILES_TO_SCAN) {
      break;
    }

    const fullPath = path.join(
      directory,
      entry.name
    );

    // Ignore unwanted directories
    if (
      entry.isDirectory() &&
      IGNORED_DIRECTORIES.has(entry.name)
    ) {
      continue;
    }

    // Recursively scan directories
    if (entry.isDirectory()) {
      await collectFiles(
        fullPath,
        rootDirectory,
        files
      );

      continue;
    }

    // Ignore anything that is not a regular file
    if (!entry.isFile()) {
      continue;
    }

    try {
      const stats = await fs.stat(fullPath);

      // Skip files larger than the allowed size
      if (stats.size > MAX_FILE_SIZE) {
        continue;
      }

      files.push({
        path: path
          .relative(rootDirectory, fullPath)
          .split(path.sep)
          .join("/"),

        fullPath,

        size: stats.size,
      });
    } catch (error) {
      console.error(
        `Could not inspect file ${fullPath}:`,
        error.message
      );
    }
  }

  return files;
};

// Scan cloned repository
export const scanRepository = async (
  repositoryPath
) => {
  try {
    console.time("⏱️ Repository Scan");

    console.log(
      `Scanning local repository: ${repositoryPath}`
    );

    // 1. Collect repository files
    const repositoryFiles =
      await collectFiles(
        repositoryPath,
        repositoryPath
      );

    console.log(
      `Files collected for scanning: ${repositoryFiles.length}`
    );

    // 2. Select analyzable files
    const analyzableFiles =
      selectAnalyzableFiles(
        repositoryFiles
      );

    console.log(
      `Analyzable files: ${analyzableFiles.length}`
    );

    // 3. Limit to maximum number of files
    const filesToScan =
      analyzableFiles.slice(
        0,
        MAX_FILES_TO_SCAN
      );

    console.log(
      `Files selected for analysis: ${filesToScan.length}`
    );

    // 4. Read actual source code
    const scannedFiles = [];

    for (const file of filesToScan) {
      try {
        const content =
          await fs.readFile(
            file.fullPath,
            "utf-8"
          );

        scannedFiles.push({
          path: file.path,
          size: file.size,
          content,
        });
      } catch (error) {
        console.error(
          `Skipping file ${file.path}:`,
          error.message
        );
      }
    }

    console.log(
      `Successfully scanned files: ${scannedFiles.length}`
    );
    console.timeEnd("⏱️ Repository Scan");

    return {
      totalRepositoryFiles:
        repositoryFiles.length,

      totalAnalyzableFiles:
        analyzableFiles.length,

      totalScannedFiles:
        scannedFiles.length,

      files: scannedFiles,
    };
  } catch (error) {
    console.timeEnd("⏱️ Repository Scan");


    console.error(
      "Repository Scanner Error:",
      error
    );

    throw error;
  }
};