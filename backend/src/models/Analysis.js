import mongoose from "mongoose";

const analysisSchema = new mongoose.Schema(
  {
    // जिस repository का analysis हुआ
    repository: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Repository",
      required: true,
    },

    // Analysis किस user ने कराया
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Overall analysis status
    status: {
      type: String,
      enum: [
        "pending",
        "analyzing",
        "completed",
        "failed",
      ],
      default: "pending",
    },

    // Overall repository health score
    healthScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // Overall repository risk level
    riskLevel: {
      type: String,
      enum: [
        "low",
        "medium",
        "high",
        "critical",
      ],
      default: "low",
    },

    // Severity breakdown
    severityCounts: {
      critical: {
        type: Number,
        default: 0,
      },

      high: {
        type: Number,
        default: 0,
      },

      medium: {
        type: Number,
        default: 0,
      },

      low: {
        type: Number,
        default: 0,
      },
    },

    // Static repository analysis metrics
    metrics: {
      totalFiles: {
        type: Number,
        default: 0,
      },

      totalLines: {
        type: Number,
        default: 0,
      },

      totalFunctions: {
        type: Number,
        default: 0,
      },

      totalImports: {
        type: Number,
        default: 0,
      },

      totalExports: {
        type: Number,
        default: 0,
      },

      totalClasses: {
        type: Number,
        default: 0,
      },

      totalSize: {
        type: Number,
        default: 0,
      },
    },

    // AI Agents के individual results
    agents: {
      bugDetection: {
        status: {
          type: String,
          default: "pending",
        },

        issuesFound: {
          type: Number,
          default: 0,
        },

        results: {
          type: Array,
          default: [],
        },
      },

      security: {
        status: {
          type: String,
          default: "pending",
        },

        issuesFound: {
          type: Number,
          default: 0,
        },

        results: {
          type: Array,
          default: [],
        },
      },

      codeReview: {
        status: {
          type: String,
          default: "pending",
        },

        issuesFound: {
          type: Number,
          default: 0,
        },

        results: {
          type: Array,
          default: [],
        },
      },

      testing: {
        status: {
          type: String,
          default: "pending",
        },

        issuesFound: {
          type: Number,
          default: 0,
        },

        results: {
          type: Array,
          default: [],
        },
      },
    },

    // Final AI-generated summary
    summary: {
      type: String,
      default: "",
    },

    // कब analysis complete हुआ
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Analysis = mongoose.model(
  "Analysis",
  analysisSchema
);

export default Analysis;