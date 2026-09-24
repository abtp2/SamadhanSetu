const jwt = require('jsonwebtoken');
const User = require('../models/User');
const OtpVerification = require('../models/OtpVerification');
const { sendVerificationOTP } = require('../services/emailService');

const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'samadhansetu_super_secure_jwt_secret_sih2026',
    { expiresIn: '30d' }
  );
};

// POST /api/auth/send-otp
const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Valid email address is required.' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    // Generate secure 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in MongoDB with TTL (10 minutes)
    await OtpVerification.findOneAndUpdate(
      { email: cleanEmail },
      { otp, createdAt: new Date() },
      { upsert: true, new: true }
    );

    // Send via Gmail SMTP (or fallback dev console)
    const result = await sendVerificationOTP(cleanEmail, otp);

    res.json({
      success: true,
      message: `A 6-digit verification code has been sent to ${cleanEmail}.`,
      mode: result.mode,
    });
  } catch (error) {
    console.error('sendOtp error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to send verification OTP.' });
  }
};

// POST /api/auth/verify-otp
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required.' });
    }

    const record = await OtpVerification.findOne({
      email: email.toLowerCase().trim(),
      otp: otp.toString().trim(),
    });

    if (!record) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code. Please request a new code.',
      });
    }

    res.json({
      success: true,
      message: 'Email address verified successfully.',
    });
  } catch (error) {
    console.error('verifyOtp error:', error);
    res.status(500).json({ success: false, message: error.message || 'Verification check failed.' });
  }
};

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, role, district, state, universityName, organizationName, department, otp } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    const cleanEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    // Verify OTP if provided
    let isEmailVerified = false;
    if (otp) {
      const record = await OtpVerification.findOne({
        email: cleanEmail,
        otp: otp.toString().trim(),
      });

      if (!record) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired verification code. Please request a new OTP.',
        });
      }

      isEmailVerified = true;
      await OtpVerification.deleteOne({ _id: record._id });
    }

    const user = await User.create({
      name,
      email: cleanEmail,
      password,
      role: role || 'citizen',
      isEmailVerified,
      district: district || 'Ranchi',
      state: state || 'Jharkhand',
      universityName: universityName || '',
      organizationName: organizationName || '',
      department: department || '',
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        district: user.district,
        state: user.state,
        universityName: user.universityName,
        organizationName: user.organizationName,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error during registration.' });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        district: user.district,
        state: user.state,
        universityName: user.universityName,
        organizationName: user.organizationName,
        department: user.department,
        designation: user.designation,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error during login.' });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('university')
      .populate('organization');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    // Don't allow password or role changes through this endpoint (roles assigned during registration only)
    delete updates.password;
    delete updates.role;

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true }).select('-password');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/auth/demo-accounts
const getDemoAccounts = async (req, res) => {
  res.json({
    success: true,
    accounts: [
      {
        role: 'citizen',
        name: 'Citizen',
        email: 'citizen@email.com',
        password: 'password123',
        district: 'Ranchi',
        description: 'Submit civic challenges and track status',
      },
      {
        role: 'student',
        name: 'Student',
        email: 'student@email.com',
        password: 'password123',
        district: 'Ranchi',
        description: 'Browse challenges and collaborate on projects',
      },
      {
        role: 'university',
        name: 'Faculty',
        email: 'faculty@email.com',
        password: 'password123',
        district: 'Jamshedpur',
        description: 'Mentor student projects and review milestones',
      },
      {
        role: 'university',
        name: 'University',
        email: 'university@email.com',
        password: 'password123',
        district: 'Ranchi',
        description: 'Institutional research coordination and project governance',
      },
      {
        role: 'industry',
        name: 'Industry',
        email: 'industry@email.com',
        password: 'password123',
        district: 'Jamshedpur',
        description: 'Fund projects and provide CSR grants',
      },
      {
        role: 'admin',
        name: 'Admin',
        email: 'admin@email.com',
        password: 'password123',
        district: 'Ranchi',
        description: 'Manage platform, verify challenges, and monitor impact',
      },
    ],
  });
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  getDemoAccounts,
  sendOtp,
  verifyOtp,
};
