const mongoose = require('mongoose');

const challengeAIAnalysisSchema = new mongoose.Schema(
  {
    challenge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Challenge',
      required: true,
      unique: true,
    },
    detectedCategory: {
      type: String,
      default: '',
    },
    severityScore: {
      type: Number,
      min: 1,
      max: 10,
      default: 5,
    },
    priorityLevel: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'MEDIUM',
    },
    structuredSummary: {
      type: String,
      default: '',
    },
    keyThemes: [{
      type: String,
    }],
    duplicateMatches: [
      {
        challengeId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Challenge',
        },
        title: String,
        similarityScore: Number, // 0 to 1
        similarityReason: String,
      },
    ],
    recommendedDomains: [{
      type: String,
    }],
    suggestedUniversities: [{
      type: String,
    }],
    solutionIdeas: [{
      type: String,
    }],
    isReviewedByAdmin: {
      type: Boolean,
      default: false,
    },
    adminCorrections: {
      category: String,
      priority: String,
      notes: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ChallengeAIAnalysis', challengeAIAnalysisSchema);
