const Challenge = require('../models/Challenge');
const ChallengeAIAnalysis = require('../models/ChallengeAIAnalysis');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { analyzeChallenge, VALID_CATEGORIES } = require('../services/aiService');
const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');

const VALID_DISTRICTS = [
  'Ranchi',
  'Dhanbad',
  'East Singhbhum',
  'Jamshedpur',
  'West Singhbhum',
  'Bokaro',
  'Hazaribagh',
  'Deoghar',
  'Dumka',
  'Giridih',
  'Palamu',
  'Ramgarh',
  'Chatra',
  'Garhwa',
  'Godda',
  'Gumla',
  'Jamtara',
  'Khunti',
  'Koderma',
  'Latehar',
  'Lohardaga',
  'Pakur',
  'Sahibganj',
  'Saraikela Kharsawan',
  'Simdega',
  'Other',
];

// Exact geographic coordinates for all 24 Jharkhand districts
const DISTRICT_COORDS = {
  'Ranchi': { lat: 23.3441, lng: 85.3096 },
  'Dhanbad': { lat: 23.7957, lng: 86.4304 },
  'East Singhbhum': { lat: 22.8046, lng: 86.2029 },
  'Jamshedpur': { lat: 22.8046, lng: 86.2029 },
  'West Singhbhum': { lat: 22.5500, lng: 85.8000 },
  'Bokaro': { lat: 23.6693, lng: 86.1511 },
  'Hazaribagh': { lat: 23.9925, lng: 85.3637 },
  'Deoghar': { lat: 24.4826, lng: 86.7000 },
  'Dumka': { lat: 24.2676, lng: 87.2492 },
  'Giridih': { lat: 24.1855, lng: 86.3095 },
  'Palamu': { lat: 24.0439, lng: 84.0700 },
  'Ramgarh': { lat: 23.6315, lng: 85.5134 },
  'Chatra': { lat: 24.2092, lng: 84.8715 },
  'Garhwa': { lat: 24.1610, lng: 83.8078 },
  'Godda': { lat: 24.8267, lng: 87.2139 },
  'Gumla': { lat: 23.0441, lng: 84.5417 },
  'Jamtara': { lat: 23.9610, lng: 86.8014 },
  'Khunti': { lat: 23.0740, lng: 85.2784 },
  'Koderma': { lat: 24.4674, lng: 85.5939 },
  'Latehar': { lat: 23.7441, lng: 84.4988 },
  'Lohardaga': { lat: 23.4418, lng: 84.6826 },
  'Pakur': { lat: 24.6341, lng: 87.8492 },
  'Sahibganj': { lat: 25.2425, lng: 87.6433 },
  'Saraikela Kharsawan': { lat: 22.7000, lng: 85.9300 },
  'Simdega': { lat: 22.6167, lng: 84.5000 },
  'Other': { lat: 23.6102, lng: 85.2799 },
};

// POST /api/challenges
const createChallenge = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      location,
      district,
      coordinates,
      affectedPeople,
      urgency,
      media,
    } = req.body;

    if (!title || !description || !location) {
      return res.status(400).json({ success: false, message: 'Title, description, and location are required.' });
    }

    const assignedDistrict = VALID_DISTRICTS.includes(district) ? district : 'Ranchi';
    const coords = coordinates && coordinates.lat && coordinates.lng
      ? { lat: Number(coordinates.lat), lng: Number(coordinates.lng) }
      : (DISTRICT_COORDS[assignedDistrict] || DISTRICT_COORDS.Ranchi);

    let submitterId = req.user ? (req.user._id || req.user.id) : null;
    if (!submitterId) {
      const defaultCitizen = (await User.findOne({ role: 'citizen' })) || (await User.findOne({}));
      submitterId = defaultCitizen ? defaultCitizen._id : null;
    }

    // Auto-upload any base64 images to Cloudinary if configured
    let processedMedia = [];
    if (Array.isArray(media)) {
      for (const item of media) {
        if (item && item.url && item.url.startsWith('data:image/')) {
          if (isCloudinaryConfigured()) {
            try {
              const uploadRes = await cloudinary.uploader.upload(item.url, {
                folder: 'samadhansetu/challenges',
                resource_type: 'auto',
              });
              processedMedia.push({
                url: uploadRes.secure_url,
                type: 'image',
                caption: item.caption || '',
              });
              continue;
            } catch (cloudErr) {
              console.error('[Cloudinary Auto-Upload in Challenge Error]', cloudErr.message);
            }
          }
        }
        processedMedia.push(item);
      }
    }

    const challenge = await Challenge.create({
      title,
      description,
      category: category && VALID_CATEGORIES.includes(category) ? category : 'Public services',
      location,
      district: assignedDistrict,
      coordinates: coords,
      affectedPeople: affectedPeople || '100-500 residents',
      urgency: urgency || 'MEDIUM',
      media: processedMedia,
      submittedBy: submitterId,
      status: 'SUBMITTED',
    });

    // Run AI Analysis immediately
    try {
      await analyzeChallenge(challenge._id);
    } catch (aiErr) {
      console.warn(`[AI] Async AI analysis error:`, aiErr.message);
    }

    // Re-fetch populated challenge
    const populated = await Challenge.findById(challenge._id)
      .populate('submittedBy', 'name email district')
      .populate('aiAnalysis');

    // Notify admins of new submission
    try {
      const admins = await User.find({ role: 'admin' }).select('_id');
      for (const admin of admins) {
        await Notification.create({
          recipient: admin._id,
          title: 'New Challenge Reported',
          message: `Citizen reported: "${challenge.title}" in ${challenge.district}`,
          link: `/admin/verification`,
          type: 'CHALLENGE',
        });
      }
    } catch (notifErr) {
      // Non-blocking
    }

    res.status(201).json({
      success: true,
      message: 'Challenge submitted successfully and analyzed by AI.',
      challenge: populated,
    });
  } catch (error) {
    console.error('Create challenge error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/challenges
const getAllChallenges = async (req, res) => {
  try {
    const { district, category, status, urgency, search, page = 1, limit = 20 } = req.query;

    const filter = {};

    if (district && district !== 'All') {
      filter.district = district;
    }

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (urgency && urgency !== 'All') {
      filter.urgency = urgency;
    }

    if (search && search.trim() !== '') {
      filter.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { location: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [challenges, total] = await Promise.all([
      Challenge.find(filter)
        .populate('submittedBy', 'name email district role')
        .populate('aiAnalysis')
        .populate('assignedUniversity', 'name district')
        .populate('project', 'title currentPhase progressPercentage')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Challenge.countDocuments(filter),
    ]);

    res.json({
      success: true,
      challenges,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/challenges/:id
const getChallengeById = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id)
      .populate('submittedBy', 'name email district phone avatar role')
      .populate('aiAnalysis')
      .populate('assignedUniversity')
      .populate({
        path: 'project',
        populate: [
          { path: 'teamLeader', select: 'name email role department' },
          { path: 'facultyMentor', select: 'name email role department' },
          { path: 'university', select: 'name district domains' },
        ],
      });

    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found.' });
    }

    res.json({
      success: true,
      challenge,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/challenges/my
const getMyChallenges = async (req, res) => {
  try {
    let userId = req.user ? (req.user._id || req.user.id) : null;
    if (!userId) {
      const defaultCitizen = (await User.findOne({ role: 'citizen' })) || (await User.findOne({}));
      userId = defaultCitizen ? defaultCitizen._id : null;
    }

    const filter = userId ? { submittedBy: userId } : {};
    const challenges = await Challenge.find(filter)
      .populate('aiAnalysis')
      .populate('assignedUniversity', 'name district')
      .populate('project', 'title currentPhase progressPercentage')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      challenges,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/challenges/:id/analyze
const triggerAIAnalysis = async (req, res) => {
  try {
    const analysis = await analyzeChallenge(req.params.id);
    const challenge = await Challenge.findById(req.params.id).populate('aiAnalysis');

    res.json({
      success: true,
      message: 'AI analysis generated successfully.',
      analysis,
      challenge,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/challenges/:id/status
const updateChallengeStatus = async (req, res) => {
  try {
    const { status, adminNotes, priority, assignedUniversity } = req.body;
    const challenge = await Challenge.findById(req.params.id);

    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found.' });
    }

    if (status) challenge.status = status;
    if (adminNotes !== undefined) challenge.adminNotes = adminNotes;
    if (priority) challenge.priority = priority;
    if (assignedUniversity) challenge.assignedUniversity = assignedUniversity;

    if (status === 'VERIFIED') {
      challenge.verifiedBy = req.user.id;
      challenge.verifiedAt = new Date();
    } else if (status === 'RESOLVED') {
      challenge.resolvedAt = new Date();
    }

    await challenge.save();

    // Notify citizen of status update
    try {
      await Notification.create({
        recipient: challenge.submittedBy,
        title: `Challenge Status: ${challenge.status}`,
        message: `Your reported challenge "${challenge.title}" is now marked as ${challenge.status}.`,
        link: `/challenges/${challenge._id}`,
        type: 'CHALLENGE',
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
      message: `Status updated to ${status}.`,
      challenge: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/challenges/metadata
const getMetadata = (req, res) => {
  res.json({
    success: true,
    categories: VALID_CATEGORIES,
    districts: VALID_DISTRICTS,
    statuses: [
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
    urgencies: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
  });
};

module.exports = {
  createChallenge,
  getAllChallenges,
  getChallengeById,
  getMyChallenges,
  triggerAIAnalysis,
  updateChallengeStatus,
  getMetadata,
  DISTRICT_COORDS,
};
