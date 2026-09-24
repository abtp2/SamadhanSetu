const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      enum: ['Industry', 'Startup', 'CSR', 'Research Organization', 'NGO'],
      default: 'Industry',
    },
    industrySector: {
      type: String,
      required: true,
      default: 'Technology & Manufacturing',
    },
    district: {
      type: String,
      default: 'Ranchi',
    },
    state: {
      type: String,
      default: 'Jharkhand',
    },
    contactEmail: {
      type: String,
      required: true,
    },
    contactPerson: {
      type: String,
      default: '',
    },
    website: {
      type: String,
      default: '',
    },
    fundingBudgetAvailable: {
      type: Number,
      default: 1000000, // INR
    },
    activePartnershipsCount: {
      type: Number,
      default: 0,
    },
    logo: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Organization', organizationSchema);
