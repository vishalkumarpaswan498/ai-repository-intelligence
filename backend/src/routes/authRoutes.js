import express from "express";

import {
  registerUser,
  verifyEmailOTP,
  loginUser,
  forgotPassword,
  resetPassword,
  getCurrentUser,
} from "../controllers/authController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// Public routes
router.post(
  "/register",
  authLimiter,
  registerUser
);

router.post(
  "/verify-otp",
  authLimiter,
  verifyEmailOTP
);

router.post(
  "/login",
  authLimiter,
  loginUser
);

router.post(
  "/forgot-password",
  authLimiter,
  forgotPassword
);

router.post(
  "/reset-password",
  authLimiter,
  resetPassword
);

router.post(
  "/register",
  registerUser
);

router.post(
  "/verify-otp",
  verifyEmailOTP
);

router.post(
  "/login",
  loginUser
);

router.post(
  "/forgot-password",
  forgotPassword
);

router.post(
  "/reset-password",
  resetPassword
);

// Protected route

router.get(
  "/me",
  authMiddleware,
  getCurrentUser
);

export default router;