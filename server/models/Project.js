const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    abstract: {
      type: String,
      required: true,
    },
    challenge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Challenge',
      required: true,
    },
    university: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'University',
      required: true,
    },
    teamLeader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    facultyMentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    proposalDoc: {
      title: { type: String, default: 'Technical Proposal' },
      url: { type: String, default: '' },
      methodology: { type: String, default: '' },
      expectedOutcome: { type: String, default: '' },
      submittedAt: { type: Date, default: Date.now },
    },
    budgetEstimated: {
      type: Number,
      default: 150000,
    },
    budgetFunded: {
      type: Number,
      default: 0,
    },
    currentPhase: {
      type: String,
      enum: ['RESEARCH', 'PROTOTYPING', 'TESTING', 'PILOT_DEPLOYMENT', 'IMPLEMENTED', 'RESOLVED'],
      default: 'RESEARCH',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'ON_HOLD', 'COMPLETED', 'WITHDRAWN'],
      default: 'ACTIVE',
    },
    progressPercentage: {
      type: Number,
      default: 15,
      min: 0,
      max: 100,
    },
    outcomeSummary: {
      type: String,
      default: '',
    },
    beneficiaryCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Project', projectSchema);
