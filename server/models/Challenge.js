const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Challenge title is required'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Education',
        'Healthcare',
        'Agriculture',
        'Water & sanitation',
        'Environment',
        'Energy',
        'Rural livelihoods',
        'Accessibility',
        'Urban infrastructure',
        'Public services',
      ],
      default: 'Public services',
    },
    location: {
      type: String,
      required: [true, 'Location description/address is required'],
      trim: true,
    },
    district: {
      type: String,
      required: [true, 'District is required'],
      enum: [
        'Bokaro',
        'Chatra',
        'Deoghar',
        'Dhanbad',
        'Dumka',
        'East Singhbhum',
        'Garhwa',
        'Giridih',
        'Godda',
        'Gumla',
        'Hazaribagh',
        'Jamshedpur',
        'Jamtara',
        'Khunti',
        'Koderma',
        'Latehar',
        'Lohardaga',
        'Pakur',
        'Palamu',
        'Ramgarh',
        'Ranchi',
        'Sahibganj',
        'Sahebganj',
        'Saraikela Kharsawan',
        'Seraikela Kharsawan',
        'Simdega',
        'West Singhbhum',
        'Other',
      ],
      default: 'Ranchi',
    },
    coordinates: {
      lat: {
        type: Number,
        required: true,
        default: 23.3441, // Ranchi default
      },
      lng: {
        type: Number,
        required: true,
        default: 85.3096,
      },
    },
    media: [
      {
        url: { type: String, required: true },
        type: { type: String, default: 'image' },
        caption: { type: String, default: '' },
      },
    ],
    affectedPeople: {
      type: String,
      default: '100-500 residents',
    },
    urgency: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
    },
    status: {
      type: String,
      enum: [
        'SUBMITTED',
        'AI_ANALYZED',
        'UNDER_REVIEW',
        'VERIFIED',
        'ASSIGNED',
        'IN_PROGRESS',
        'SOLUTION_SUBMITTED',
        'PILOTING',
        'IMPLEMENTED',
        'RESOLVED',
      ],
      default: 'SUBMITTED',
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'MEDIUM',
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    aiAnalysis: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChallengeAIAnalysis',
      default: null,
    },
    assignedUniversity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'University',
      default: null,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
    },
    adminNotes: {
      type: String,
      default: '',
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast district, category, and geo searches
challengeSchema.index({ district: 1, category: 1, status: 1 });
challengeSchema.index({ 'coordinates.lat': 1, 'coordinates.lng': 1 });
challengeSchema.index({ title: 'text', description: 'text', location: 'text' });

module.exports = mongoose.model('Challenge', challengeSchema);
