import express from "express";

import {
  createRepository,
  getRepositories,
  getRepositoryById,
  deleteRepository,
} from "../controllers/repositoryController.js";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  repositoryValidation,
  validateRequest,
} from "../middleware/validation.js";

const router = express.Router();

// All repository routes are protected

// Create repository
router.post("/", authMiddleware, repositoryValidation, validateRequest, createRepository);

// Get all repositories
router.get("/", authMiddleware, getRepositories);

// Get single repository
router.get("/:id", authMiddleware, getRepositoryById);

// Delete repository
router.delete("/:id", authMiddleware, deleteRepository);

export default router;