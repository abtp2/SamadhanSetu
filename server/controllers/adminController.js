const Challenge = require('../models/Challenge');
const ChallengeAIAnalysis = require('../models/ChallengeAIAnalysis');
const University = require('../models/University');
const Organization = require('../models/Organization');
const Project = require('../models/Project');
const Notification = require('../models/Notification');
const User = require('../models/User');

// GET /api/admin/verification-queue
const getVerificationQueue = async (req, res) => {
  try {
    const queue = await Challenge.find({
      status: { $in: ['SUBMITTED', 'AI_ANALYZED', 'UNDER_REVIEW'] },
    })
      .populate('submittedBy', 'name email district phone')
      .populate('aiAnalysis')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: queue.length,
      challenges: queue,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/admin/verify/:id
const verifyChallenge = async (req, res) => {
  try {
    const {
      status, // 'VERIFIED' or 'REJECTED' or 'UNDER_REVIEW'
      priority,
      category,
      assignedUniversity,
      adminNotes,
    } = req.body;

    const challenge = await Challenge.findById(req.params.id).populate('aiAnalysis');
    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found.' });
    }

    if (status) challenge.status = status;
    if (priority) challenge.priority = priority;
    if (category) challenge.category = category;
    if (assignedUniversity) challenge.assignedUniversity = assignedUniversity;
    if (adminNotes) challenge.adminNotes = adminNotes;

    challenge.verifiedBy = req.user.id;
    challenge.verifiedAt = new Date();
    await challenge.save();

    // Mark AI analysis reviewed
    if (challenge.aiAnalysis) {
      await ChallengeAIAnalysis.findByIdAndUpdate(challenge.aiAnalysis._id, {
        isReviewedByAdmin: true,
        adminCorrections: {
          category: category || challenge.category,
          priority: priority || challenge.priority,
          notes: adminNotes || '',
        },
      });
    }

    // Notify submitting citizen
    try {
      await Notification.create({
        recipient: challenge.submittedBy,
        title: `Challenge Verified by Government Admin`,
        message: `Your challenge "${challenge.title}" was verified and published for university adoption.`,
        link: `/challenges/${challenge._id}`,
        type: 'SUCCESS',
      });
    } catch (notifErr) {
      // Non-blocking
    }

    const updated = await Challenge.findById(challenge._id)
      .populate('submittedBy', 'name email district')
      .populate('aiAnalysis')
      .populate('assignedUniversity', 'name district');

    res.json({
      success: true,
      message: `Challenge verified and marked as ${challenge.status}.`,
      challenge: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/admin/universities
const getUniversities = async (req, res) => {
  try {
    const universities = await University.find().sort({ name: 1 });
    res.json({ success: true, universities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/admin/universities
const createUniversity = async (req, res) => {
  try {
    const uni = await University.create(req.body);
    res.status(201).json({ success: true, university: uni });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/admin/organizations
const getOrganizations = async (req, res) => {
  try {
    const organizations = await Organization.find().sort({ name: 1 });
    res.json({ success: true, organizations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/admin/organizations
const createOrganization = async (req, res) => {
  try {
    const org = await Organization.create(req.body);
    res.status(201).json({ success: true, organization: org });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getVerificationQueue,
  verifyChallenge,
  getUniversities,
  createUniversity,
  getOrganizations,
  createOrganization,
};
