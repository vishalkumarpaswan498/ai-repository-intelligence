import https from "https";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

const execFileAsync = promisify(execFile);


// Fetch GitHub repository information
export const getGitHubRepository = async (githubUrl) => {
  try {
    const url = new URL(githubUrl);

    const parts = url.pathname
      .split("/")
      .filter(Boolean);

    if (parts.length < 2) {
      throw new Error("Invalid GitHub repository URL");
    }

    const owner = parts[0];
    const repo = parts[1].replace(".git", "");

    const data = await new Promise((resolve, reject) => {
      const options = {
        hostname: "api.github.com",
        path: `/repos/${owner}/${repo}`,
        method: "GET",
        headers: {
          "User-Agent": "AI-Repository-Intelligence",
          Accept: "application/vnd.github+json",
        },
      };

      const request = https.request(options, (response) => {
        let body = "";

        response.on("data", (chunk) => {
          body += chunk;
        });

        response.on("end", () => {
          try {
            const result = JSON.parse(body);

            if (response.statusCode !== 200) {
              reject(
                new Error(
                  result.message || "Failed to fetch GitHub repository"
                )
              );
              return;
            }

            resolve(result);
          } catch (error) {
            reject(error);
          }
        });
      });

      request.on("error", reject);

      request.end();
    });

    return {
      owner: data.owner.login,
      name: data.name,
      description: data.description || "",
      language: data.language || "Unknown",
      defaultBranch: data.default_branch,
      stars: data.stargazers_count,
      forks: data.forks_count,
      openIssues: data.open_issues_count,
      htmlUrl: data.html_url,
    };
  } catch (error) {
    console.error("GitHub Service Error:", error);
    throw error;
  }
};
// Clone GitHub repository
export const cloneRepository = async (githubUrl) => {
  if (!githubUrl) {
    throw new Error("GitHub repository URL is required");
  }

  let url;

  try {
    url = new URL(githubUrl);
  } catch {
    throw new Error("Invalid GitHub repository URL");
  }

  // Only HTTPS GitHub URLs
  if (
    url.protocol !== "https:" ||
    (url.hostname !== "github.com" &&
      url.hostname !== "www.github.com")
  ) {
    throw new Error(
      "Only valid GitHub HTTPS repository URLs are allowed"
    );
  }

  // Remove empty path parts
  const parts = url.pathname
    .split("/")
    .filter(Boolean);

  /*
    Only repository root is allowed:

    ✅ https://github.com/user/repository

    ❌ https://github.com/user/repository/tree/main
    ❌ https://github.com/user/repository/tree/main/src
    ❌ https://github.com/user/repository/blob/main/file.js
  */

  if (parts.length !== 2) {
    throw new Error(
      "Please provide the GitHub repository root URL, not a branch or folder URL"
    );
  }

  const owner = parts[0];
  const repo = parts[1].replace(/\.git$/, "");

  if (!owner || !repo) {
    throw new Error(
      "Invalid GitHub repository URL"
    );
  }

  const normalizedUrl =
    `https://github.com/${owner}/${repo}.git`;

  const tempBase = await fs.mkdtemp(
    path.join(
      os.tmpdir(),
      "repo-analysis-"
    )
  );

  const repositoryPath = path.join(
    tempBase,
    "repository"
  );

  console.log(
    `Cloning repository: ${normalizedUrl}`
  );

  try {
    await execFileAsync(
      "git",
      [
        "clone",
        "--depth",
        "1",
        normalizedUrl,
        repositoryPath,
      ],
      {
        maxBuffer: 10 * 1024 * 1024,
      }
    );

    console.log(
      `Repository cloned to: ${repositoryPath}`
    );

    return repositoryPath;
  } catch (error) {
    await fs.rm(tempBase, {
      recursive: true,
      force: true,
    });

    console.error(
      "GitHub Clone Error:",
      error.message
    );

    throw new Error(
      `Failed to clone repository: ${error.message}`
    );
  }
};

// Cleanup temporary repository
export const cleanupRepository = async (
  repositoryPath
) => {
  if (!repositoryPath) return;

  try {
    const tempBase = path.dirname(repositoryPath);

    await fs.rm(tempBase, {
      recursive: true,
      force: true,
    });

    console.log(
      `Temporary repository cleaned: ${tempBase}`
    );
  } catch (error) {
    console.error(
      "Repository cleanup error:",
      error.message
    );
  }
};