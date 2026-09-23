import Analysis from "../models/Analysis.js";
import Repository from "../models/Repository.js";
import { analysisQueue } from "../queues/analysisQueue.js";

// =====================================================
// START REPOSITORY ANALYSIS
// =====================================================

export const startAnalysis = async (req, res) => {
  try {
    const { repositoryId } = req.body;

    // 1. Validate repository ID
    if (!repositoryId) {
      return res.status(400).json({
        success: false,
        message: "Repository ID is required",
      });
    }

    // 2. Find repository owned by logged-in user
    const repository = await Repository.findOne({
      _id: repositoryId,
      owner: req.user._id,
    });

    if (!repository) {
      return res.status(404).json({
        success: false,
        message: "Repository not found",
      });
    }

    // 3. Check only REAL active analysis
    const activeAnalysis = await Analysis.findOne({
      repository: repository._id,
      user: req.user._id,
      status: {
        $in: ["pending", "analyzing"],
      },
    }).sort({ createdAt: -1 });

    if (activeAnalysis) {
      return res.status(409).json({
        success: false,
        message: "Repository analysis is already running",
        analysisId: activeAnalysis._id,
        status: activeAnalysis.status,
      });
    }

    // 4. Create analysis record
    const analysis = await Analysis.create({
      repository: repository._id,
      user: req.user._id,
      status: "pending",
    });

    // 5. Update repository status
    repository.analysisStatus = "pending";
    await repository.save();

    // 6. Add BullMQ job
    const job = await analysisQueue.add(
      "repository-analysis",
      {
        repositoryId: repository._id.toString(),
        analysisId: analysis._id.toString(),
      },
      {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 5000,
        },
        removeOnComplete: 20,
        removeOnFail: 50,
      }
    );

    console.log(
      `✅ Analysis job added: ${job.id}`
    );

    return res.status(201).json({
      success: true,
      message: "Repository analysis queued successfully",
      analysisId: analysis._id,
      jobId: job.id,
      repositoryId: repository._id,
      repositoryName: repository.name,
      status: "pending",
    });

  } catch (error) {
    console.error(
      "❌ Start Analysis Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to start repository analysis",
      error: error.message,
    });
  }
};


// =====================================================
// GET SINGLE ANALYSIS
// =====================================================

export const getAnalysisById = async (req, res) => {
  try {
    const { analysisId } = req.params;

    if (!analysisId) {
      return res.status(400).json({
        success: false,
        message: "Analysis ID is required",
      });
    }

    const analysis = await Analysis.findOne({
      _id: analysisId,
      user: req.user._id,
    }).populate(
      "repository",
      "name githubUrl language analysisStatus"
    );

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "Analysis not found",
      });
    }

    return res.status(200).json({
      success: true,
      analysis,
    });

  } catch (error) {
    console.error(
      "❌ Get Analysis Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch analysis",
      error: error.message,
    });
  }
};


// =====================================================
// GET ALL ANALYSES
// =====================================================

export const getAnalyses = async (req, res) => {
  try {
    const analyses = await Analysis.find({
      user: req.user._id,
    })
      .populate(
        "repository",
        "name githubUrl language healthScore analysisStatus"
      )
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: analyses.length,
      analyses,
    });

  } catch (error) {
    console.error(
      "❌ Get Analyses Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch analyses",
      error: error.message,
    });
  }
};


// =====================================================
// GET ANALYSIS STATUS
// =====================================================

export const getAnalysisStatus = async (req, res) => {
  try {
    const { analysisId } = req.params;

    const analysis = await Analysis.findOne({
      _id: analysisId,
      user: req.user._id,
    }).select(
      "repository status healthScore completedAt createdAt updatedAt"
    );

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "Analysis not found",
      });
    }

    return res.status(200).json({
      success: true,
      analysis: {
        id: analysis._id,
        repository: analysis.repository,
        status: analysis.status,
        healthScore: analysis.healthScore,
        completedAt: analysis.completedAt,
        createdAt: analysis.createdAt,
        updatedAt: analysis.updatedAt,
      },
    });

  } catch (error) {
    console.error(
      "❌ Get Analysis Status Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch analysis status",
      error: error.message,
    });
  }
};


// =====================================================
// RE-ANALYZE REPOSITORY
// =====================================================

export const reanalyzeRepository = async (req, res) => {
  try {
    const { repositoryId } = req.params;

    // 1. Find user's repository
    const repository = await Repository.findOne({
      _id: repositoryId,
      owner: req.user._id,
    });

    if (!repository) {
      return res.status(404).json({
        success: false,
        message: "Repository not found",
      });
    }

    // 2. Check active analysis from DB
    const activeAnalysis = await Analysis.findOne({
      repository: repository._id,
      user: req.user._id,
      status: {
        $in: ["pending", "analyzing"],
      },
    });

    if (activeAnalysis) {
      return res.status(409).json({
        success: false,
        message: "Repository analysis is already running",
        analysisId: activeAnalysis._id,
        status: activeAnalysis.status,
      });
    }

    // 3. Create new analysis
    const analysis = await Analysis.create({
      repository: repository._id,
      user: req.user._id,
      status: "pending",
    });

    // 4. Update repository
    repository.analysisStatus = "pending";
    await repository.save();

    // 5. Add job
    const job = await analysisQueue.add(
      "repository-analysis",
      {
        repositoryId: repository._id.toString(),
        analysisId: analysis._id.toString(),
      },
      {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 5000,
        },
        removeOnComplete: 20,
        removeOnFail: 50,
      }
    );

    console.log(
      `✅ Re-analysis job added: ${job.id}`
    );

    return res.status(201).json({
      success: true,
      message: "Re-analysis queued successfully",
      analysisId: analysis._id,
      jobId: job.id,
      repositoryId: repository._id,
      repositoryName: repository.name,
      status: "pending",
    });

  } catch (error) {
    console.error(
      "❌ Re-analysis Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to start re-analysis",
      error: error.message,
    });
  }
};