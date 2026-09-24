const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    order: {
      type: Number,
      default: 1,
    },
    targetDate: {
      type: Date,
      required: true,
    },
    completionDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['PENDING', 'IN_PROGRESS', 'SUBMITTED', 'VERIFIED', 'REJECTED'],
      default: 'PENDING',
    },
    proofAttachments: [
      {
        title: { type: String, default: '' },
        url: { type: String, required: true },
        type: { type: String, default: 'document' },
      },
    ],
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    verificationNotes: {
      type: String,
      default: '',
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Milestone', milestoneSchema);
