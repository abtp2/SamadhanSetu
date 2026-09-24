const mongoose = require('mongoose');

const universitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    code: {
      type: String,
      default: '',
    },
    district: {
      type: String,
      required: true,
      default: 'Ranchi',
    },
    state: {
      type: String,
      default: 'Jharkhand',
    },
    domains: [{
      type: String,
    }],
    contactEmail: {
      type: String,
      required: true,
    },
    facultyCount: {
      type: Number,
      default: 150,
    },
    studentCount: {
      type: Number,
      default: 4500,
    },
    activeProjectsCount: {
      type: Number,
      default: 0,
    },
    completedProjectsCount: {
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

module.exports = mongoose.model('University', universitySchema);
