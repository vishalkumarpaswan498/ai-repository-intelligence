import Repository from "../models/Repository.js";

// Normalize GitHub repository URL
const normalizeGitHubUrl = (url) => {
  try {
    const parsedUrl = new URL(url.trim());

    if (parsedUrl.hostname !== "github.com") {
      return null;
    }

    const parts = parsedUrl.pathname
      .split("/")
      .filter(Boolean);

    // GitHub repository must be:
    // /username/repository
    if (parts.length < 2) {
      return null;
    }

    const owner = parts[0];
    const repo = parts[1]
      .replace(/\.git$/, "");

    return `https://github.com/${owner}/${repo}`;
  } catch {
    return null;
  }
};


// Create Repository
export const createRepository = async (req, res) => {
  try {
    const {
      name,
      githubUrl,
      description,
      language,
    } = req.body;

    if (!name || !githubUrl) {
      return res.status(400).json({
        success: false,
        message:
          "Repository name and GitHub URL are required",
      });
    }

    const normalizedUrl =
      normalizeGitHubUrl(githubUrl);

    if (!normalizedUrl) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid GitHub repository URL",
      });
    }

    // Prevent duplicate repository
    const existingRepository =
      await Repository.findOne({
        owner: req.user._id,
        githubUrl: normalizedUrl,
      });

    if (existingRepository) {
      return res.status(409).json({
        success: false,
        message:
          "This repository is already added",
        repository: existingRepository,
      });
    }

    const repository =
      await Repository.create({
        owner: req.user._id,
        name,
        githubUrl: normalizedUrl,
        description,
        language,
        analysisStatus: "idle",
        healthScore: 0,
      });

    return res.status(201).json({
      success: true,
      message:
        "Repository added successfully",
      repository,
    });

  } catch (error) {
    console.error(
      "Create repository error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};


// Get All Repositories of Logged-in User
export const getRepositories = async (req, res) => {
  try {
    const repositories =
      await Repository.find({
        owner: req.user._id,
      }).sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: repositories.length,
      repositories,
    });

  } catch (error) {
    console.error(
      "Get repositories error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// Get Single Repository
export const getRepositoryById = async (
  req,
  res
) => {
  try {
    const repository =
      await Repository.findOne({
        _id: req.params.id,
        owner: req.user._id,
      });

    if (!repository) {
      return res.status(404).json({
        success: false,
        message: "Repository not found",
      });
    }

    return res.status(200).json({
      success: true,
      repository,
    });

  } catch (error) {
    console.error(
      "Get repository error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// Delete Repository
export const deleteRepository = async (
  req,
  res
) => {
  try {
    const repository =
      await Repository.findOneAndDelete({
        _id: req.params.id,
        owner: req.user._id,
      });

    if (!repository) {
      return res.status(404).json({
        success: false,
        message: "Repository not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Repository deleted successfully",
    });

  } catch (error) {
    console.error(
      "Delete repository error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};