import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  getDashboardSummary,
} from "../controllers/dashboardController.js";

const router = express.Router();

// Get dashboard summary
router.get(
  "/summary",
  authMiddleware,
  getDashboardSummary
);

export default router;