import { body, validationResult } from "express-validator";

// ===============================
// Common Validation Handler
// ===============================
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
    });
  }

  next();
};

// ===============================
// Register Validation
// ===============================
export const registerValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),

  body("email")
    .trim()
    .isEmail()
    .withMessage("Please enter a valid email address")
    .normalizeEmail(),

  body("password")
    .isLength({ min: 6, max: 100 })
    .withMessage("Password must be between 6 and 100 characters"),
];

// ===============================
// Login Validation
// ===============================
export const loginValidation = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Please enter a valid email address"),

  body("password")
    .notEmpty()
    .withMessage("Password is required"),
];

// ===============================
// Forgot Password Validation
// ===============================
export const forgotPasswordValidation = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Please enter a valid email address"),
];

// ===============================
// Reset Password Validation
// ===============================
export const resetPasswordValidation = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Please enter a valid email address"),

  body("otp")
    .trim()
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP must be exactly 6 digits")
    .isNumeric()
    .withMessage("OTP must contain only numbers"),

  body("password")
    .isLength({ min: 6, max: 100 })
    .withMessage("Password must be between 6 and 100 characters"),
];

// ===============================
// Verify Email OTP Validation
// ===============================
export const verifyOTPValidation = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Please enter a valid email address"),

  body("otp")
    .trim()
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP must be exactly 6 digits")
    .isNumeric()
    .withMessage("OTP must contain only numbers"),
];

// ===============================
// GitHub Repository Validation
// ===============================
export const repositoryValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Repository name is required")
    .isLength({ min: 1, max: 100 })
    .withMessage("Repository name must be between 1 and 100 characters"),

  body("githubUrl")
    .trim()
    .notEmpty()
    .withMessage("GitHub repository URL is required")

    .custom((value) => {
      let url;

      try {
        url = new URL(value);
      } catch {
        throw new Error("Please provide a valid GitHub repository URL");
      }

      // Only HTTPS is allowed
      if (url.protocol !== "https:") {
        throw new Error("GitHub URL must use HTTPS");
      }

      // Only GitHub domains are allowed
      if (
        url.hostname !== "github.com" &&
        url.hostname !== "www.github.com"
      ) {
        throw new Error("Only GitHub repository URLs are allowed");
      }

      // Reject username/password in URL
      if (url.username || url.password) {
        throw new Error("Invalid GitHub repository URL");
      }

      // Reject query parameters and hash
      if (url.search || url.hash) {
        throw new Error("GitHub URL must not contain query parameters or hash");
      }

      // Extract repository path
      const parts = url.pathname.split("/").filter(Boolean);

      // Expected:
      // https://github.com/username/repository
      if (parts.length !== 2) {
        throw new Error("Please provide a valid GitHub repository URL");
      }

      // Repository name can optionally end with .git
      const repositoryName = parts[1].replace(/\.git$/, "");

      if (!repositoryName) {
        throw new Error("Invalid GitHub repository URL");
      }

      return true;
    }),
];