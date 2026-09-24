const mongoose = require('mongoose');

const collaborationRequestSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['FUNDING', 'MENTORSHIP', 'EQUIPMENT', 'PILOT_DEPLOYMENT', 'CSR_GRANT'],
      default: 'FUNDING',
    },
    title: {
      type: String,
      required: true,
    },
    offerDetails: {
      type: String,
      required: true,
    },
    amountOffered: {
      type: Number,
      default: 0,
    },
    resourcesOffered: [{
      type: String,
    }],
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'DECLINED', 'IN_DISCUSSION'],
      default: 'PENDING',
    },
    adminEndorsement: {
      type: Boolean,
      default: false,
    },
    responseNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('CollaborationRequest', collaborationRequestSchema);
