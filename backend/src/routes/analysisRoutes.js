import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  startAnalysis,
  getAnalysisById,
  getAnalyses,
  getAnalysisStatus,
  reanalyzeRepository,
} from "../controllers/analysisController.js";

const router = express.Router();

// Start repository analysis
router.post(
  "/start",
  authMiddleware,
  startAnalysis
);

// Get all analyses of logged-in user
router.get(
  "/",
  authMiddleware,
  getAnalyses
);

router.get(
  "/:analysisId/status",
  authMiddleware,
  getAnalysisStatus
);

// Get single analysis result
router.get(
  "/:analysisId",
  authMiddleware,
  getAnalysisById
);

// Re-analyze repository

router.post(
  "/repository/:repositoryId/reanalyze",
  authMiddleware,
  reanalyzeRepository
);

export default router;