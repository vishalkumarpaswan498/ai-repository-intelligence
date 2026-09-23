import mongoose from "mongoose";
import Repository from "../models/Repository.js";
import Analysis from "../models/Analysis.js";

// Get dashboard summary
export const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    // Total repositories
    const totalRepositories =
      await Repository.countDocuments({
        owner: userId,
      });

    // Total analyses
    const totalAnalyses =
      await Analysis.countDocuments({
        user: userId,
      });

    // Completed analyses
    const completedAnalyses =
      await Analysis.countDocuments({
        user: userId,
        status: "completed",
      });

    // Pending analyses
    const pendingAnalyses =
      await Analysis.countDocuments({
        user: userId,
        status: "pending",
      });

    // Currently analyzing
    const analyzingAnalyses =
      await Analysis.countDocuments({
        user: userId,
        status: "analyzing",
      });

    // Failed analyses
    const failedAnalyses =
      await Analysis.countDocuments({
        user: userId,
        status: "failed",
      });

   // Calculate average health score
const healthScoreResult =
  await Analysis.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        status: "completed",
        healthScore: {
          $gt: 0,
        },
      },
    },
    {
      $group: {
        _id: null,
        averageHealthScore: {
          $avg: "$healthScore",
        },
      },
    },
  ]);

const averageHealthScore =
  healthScoreResult.length > 0
    ? Math.round(
        healthScoreResult[0].averageHealthScore
      )
    : 0;

    // Get recent analyses
const recentAnalyses =
  await Analysis.find({
    user: userId,
  })
    .populate(
      "repository",
      "name githubUrl"
    )
    .sort({
      createdAt: -1,
    })
    .limit(5)
    .select(
      "repository status healthScore createdAt completedAt riskLevel"
    );

    return res.status(200).json({
      success: true,

      dashboard: {
  totalRepositories,
  totalAnalyses,
  completedAnalyses,
  pendingAnalyses,
  analyzingAnalyses,
  failedAnalyses,
  averageHealthScore,
  recentAnalyses,
},
    });
  } catch (error) {
    console.error(
      "Dashboard Summary Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard summary",
      error: error.message,
    });
  }
};