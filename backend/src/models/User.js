import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    preferences: {
  analysisNotifications: {
    type: Boolean,
    default: true,
  },

  systemNotifications: {
    type: Boolean,
    default: true,
  },
},

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    // Email verification
    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerificationOTP: {
      type: String,
      default: null,
    },

    emailVerificationOTPExpires: {
      type: Date,
      default: null,
    },

    // Forgot password OTP
    passwordResetOTP: {
      type: String,
      default: null,
    },

    passwordResetOTPExpires: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;