const Challenge = require('../models/Challenge');
const ChallengeAIAnalysis = require('../models/ChallengeAIAnalysis');
const University = require('../models/University');
const Organization = require('../models/Organization');
const Project = require('../models/Project');
const Milestone = require('../models/Milestone');
const Notification = require('../models/Notification');
const User = require('../models/User');

// GET /api/admin/verification-queue
// Returns all challenges with AI triage analysis, university assignment, and ongoing project work
const getVerificationQueue = async (req, res) => {
  try {
    const { status, district, category, search } = req.query;

    const filter = {};
    if (status && status !== 'ALL') {
      if (status === 'PENDING') {
        filter.status = { $in: ['SUBMITTED', 'AI_ANALYZED', 'UNDER_REVIEW'] };
      } else {
        filter.status = status;
      }
    }

    if (district && district !== 'All') {
      filter.district = district;
    }
    if (category && category !== 'All') {
      filter.category = category;
    }
    if (search && search.trim() !== '') {
      filter.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { location: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const challenges = await Challenge.find(filter)
      .populate('submittedBy', 'name email district phone avatar')
      .populate('aiAnalysis')
      .populate('assignedUniversity', 'name district logo code domains')
      .populate({
        path: 'project',
        populate: [
          { path: 'university', select: 'name district logo' },
          { path: 'teamLeader', select: 'name email role department' },
          { path: 'facultyMentor', select: 'name email role department' },
        ],
      })
      .sort({ createdAt: -1 });

    // Aggregate counts across all issues for admin command center
    const [total, aiVerified, inProgress, underReview, resolved] = await Promise.all([
      Challenge.countDocuments(),
      Challenge.countDocuments({ status: { $in: ['VERIFIED', 'ASSIGNED'] } }),
      Challenge.countDocuments({ status: { $in: ['IN_PROGRESS', 'SOLUTION_SUBMITTED', 'PILOTING'] } }),
      Challenge.countDocuments({ status: 'UNDER_REVIEW' }),
      Challenge.countDocuments({ status: { $in: ['IMPLEMENTED', 'RESOLVED'] } }),
    ]);

    res.json({
      success: true,
      count: challenges.length,
      challenges,
      stats: {
        total,
        aiVerified,
        inProgress,
        underReview,
        resolved,
      },
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
    if (assignedUniversity !== undefined) challenge.assignedUniversity = assignedUniversity || null;
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
        title: `Challenge Status Updated by Government Admin`,
        message: `Your challenge "${challenge.title}" status is now ${challenge.status}.`,
        link: `/challenges/${challenge._id}`,
        type: 'SUCCESS',
      });
    } catch (notifErr) {
      // Non-blocking
    }

    const updated = await Challenge.findById(challenge._id)
      .populate('submittedBy', 'name email district')
      .populate('aiAnalysis')
      .populate('assignedUniversity', 'name district logo')
      .populate({
        path: 'project',
        populate: [
          { path: 'university', select: 'name district logo' },
          { path: 'teamLeader', select: 'name email role department' },
          { path: 'facultyMentor', select: 'name email role department' },
        ],
      });

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
