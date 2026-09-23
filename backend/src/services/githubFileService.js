import https from "https";

const githubRequest = (path) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api.github.com",
      path,
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
          const data = JSON.parse(body);

          if (response.statusCode < 200 || response.statusCode >= 300) {
            reject(
              new Error(
                data.message || "GitHub API request failed"
              )
            );
            return;
          }

          resolve(data);
        } catch (error) {
          reject(error);
        }
      });
    });

    request.on("error", reject);

    request.end();
  });
};

// Extract owner and repository name
const parseGitHubUrl = (githubUrl) => {
  const url = new URL(githubUrl);

  const parts = url.pathname
    .split("/")
    .filter(Boolean);

  if (parts.length < 2) {
    throw new Error("Invalid GitHub repository URL");
  }

  return {
    owner: parts[0],
    repo: parts[1].replace(".git", ""),
  };
};

// Fetch repository file tree
export const getRepositoryFiles = async (
  githubUrl,
  branch
) => {
  try {
    const { owner, repo } = parseGitHubUrl(githubUrl);

    const tree = await githubRequest(
      `/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`
    );

    const files = tree.tree
      .filter((item) => item.type === "blob")
      .map((item) => ({
        path: item.path,
        sha: item.sha,
        size: item.size || 0,
      }));

    return {
      owner,
      repo,
      branch,
      totalFiles: files.length,
      files,
    };
  } catch (error) {
    console.error("GitHub File Service Error:", error);
    throw error;
  }
};

// Fetch actual file content
export const getFileContent = async (
  githubUrl,
  filePath,
  branch
) => {
  try {
    const { owner, repo } = parseGitHubUrl(githubUrl);

    const encodedPath = filePath
      .split("/")
      .map(encodeURIComponent)
      .join("/");

    const data = await githubRequest(
      `/repos/${owner}/${repo}/contents/${encodedPath}?ref=${encodeURIComponent(branch)}`
    );

    if (data.type !== "file") {
      throw new Error(`Not a file: ${filePath}`);
    }

    if (!data.content) {
      throw new Error(`No content returned for: ${filePath}`);
    }

    const content = Buffer.from(
      data.content,
      "base64"
    ).toString("utf-8");

    return {
      path: filePath,
      size: data.size || 0,
      content,
    };
  } catch (error) {
    console.error(
      `GitHub File Content Error (${filePath}):`,
      error
    );

    throw error;
  }
};