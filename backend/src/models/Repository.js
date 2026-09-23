import mongoose from "mongoose";

const repositorySchema = new mongoose.Schema(
  {
    // Repository owner
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Repository basic information
    name: {
      type: String,
      required: true,
      trim: true,
    },

    githubUrl: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    // Main programming language
    language: {
      type: String,
      default: "Unknown",
    },

    // Analysis status
    analysisStatus: {
      type: String,
      enum: ["pending", "analyzing", "completed", "failed"],
      default: "pending",
    },

    // Repository health score
    healthScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // Last analysis date
    lastAnalyzed: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Repository = mongoose.model(
  "Repository",
  repositorySchema
);

export default Repository;