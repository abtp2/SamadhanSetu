const mongoose = require('mongoose');

const otpVerificationSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    otp: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 600, // MongoDB TTL index: Document automatically deleted after 600 seconds (10 minutes)
    },
  },
  {
    timestamps: false,
  }
);

otpVerificationSchema.index({ email: 1 });

module.exports = mongoose.model('OtpVerification', otpVerificationSchema);
