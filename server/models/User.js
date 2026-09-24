const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['citizen', 'student', 'university', 'industry', 'admin'],
    default: 'citizen',
    required: true,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  phone: {
    type: String,
    default: '',
  },
  district: {
    type: String,
    default: 'Ranchi',
  },
  state: {
    type: String,
    default: 'Jharkhand',
  },
  university: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'University',
    default: null,
  },
  universityName: {
    type: String,
    default: '',
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    default: null,
  },
  organizationName: {
    type: String,
    default: '',
  },
  department: {
    type: String,
    default: '',
  },
  designation: {
    type: String,
    default: '',
  },
  skills: [{
    type: String,
  }],
  avatar: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
