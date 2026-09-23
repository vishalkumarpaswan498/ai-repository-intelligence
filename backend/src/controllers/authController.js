import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/User.js";
import { sendOTPEmail } from "../services/emailService.js";

const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(
    100000 + Math.random() * 900000
  ).toString();
};

// Register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    const normalizedEmail =
      email.toLowerCase().trim();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      // If user exists but email is not verified,
      // generate and send a new OTP
      if (!existingUser.isEmailVerified) {
        const otp = generateOTP();

        existingUser.emailVerificationOTP = otp;
        existingUser.emailVerificationOTPExpires =
          new Date(Date.now() + 10 * 60 * 1000);

        await existingUser.save();

        await sendOTPEmail(
          existingUser.email,
          otp,
          "verification"
        );

        return res.status(200).json({
          success: true,
          message:
            "Account already exists but is not verified. A new OTP has been sent to your email.",
          email: existingUser.email,
        });
      }

      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const otp = generateOTP();

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,

      isEmailVerified: false,

      emailVerificationOTP: otp,

      emailVerificationOTPExpires:
        new Date(Date.now() + 10 * 60 * 1000),
    });

    await sendOTPEmail(
      user.email,
      otp,
      "verification"
    );

    return res.status(201).json({
      success: true,
      message:
        "Registration successful. Please check your email for the OTP.",
      email: user.email,
      requiresVerification: true,
    });
  } catch (error) {
    console.error("Register error:", error);

    return res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
};

// Verify Email OTP
export const verifyEmailOTP = async (
  req,
  res
) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const normalizedEmail =
      email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    if (
      !user.emailVerificationOTP ||
      user.emailVerificationOTP !== otp
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (
      !user.emailVerificationOTPExpires ||
      user.emailVerificationOTPExpires <
        new Date()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "OTP has expired. Please register again to receive a new OTP.",
      });
    }

    user.isEmailVerified = true;

    user.emailVerificationOTP = null;
    user.emailVerificationOTPExpires = null;

    await user.save();

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message:
        "Email verified successfully. You can now access your account.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(
      "Email verification error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Email verification failed",
      error: error.message,
    });
  }
};

// Login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required",
      });
    }

    const normalizedEmail =
      email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordCorrect =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message:
          "Please verify your email before logging in",
        requiresVerification: true,
        email: user.email,
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get current user
export const getCurrentUser = async (
  req,
  res
) => {
  try {
    return res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    console.error(
      "Get current user error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// Forgot Password - Send Reset OTP
export const forgotPassword = async (
  req,
  res
) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const normalizedEmail =
      email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "No account found with this email",
      });
    }

    const otp = generateOTP();

    user.passwordResetOTP = otp;

    user.passwordResetOTPExpires =
      new Date(
        Date.now() + 10 * 60 * 1000
      );

    await user.save();

    await sendOTPEmail(
      user.email,
      otp,
      "password-reset"
    );

    return res.status(200).json({
      success: true,
      message:
        "Password reset OTP has been sent to your email",
    });
  } catch (error) {
    console.error(
      "Forgot password error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to send password reset OTP",
    });
  }
};


// Reset Password
export const resetPassword = async (
  req,
  res
) => {
  try {
    const { email, otp, password } =
      req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email, OTP and new password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters",
      });
    }

    const normalizedEmail =
      email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (
      !user.passwordResetOTP ||
      user.passwordResetOTP !== otp
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (
      !user.passwordResetOTPExpires ||
      user.passwordResetOTPExpires <
        new Date()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "OTP has expired. Please request a new OTP.",
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    user.password = hashedPassword;

    user.passwordResetOTP = null;

    user.passwordResetOTPExpires = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message:
        "Password reset successfully. Please login with your new password.",
    });
  } catch (error) {
    console.error(
      "Reset password error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Password reset failed",
    });
  }
};

