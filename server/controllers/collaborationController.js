const CollaborationRequest = require('../models/CollaborationRequest');
const Project = require('../models/Project');
const Organization = require('../models/Organization');
const Notification = require('../models/Notification');

// POST /api/collaborations
const createCollaboration = async (req, res) => {
  try {
    const { projectId, type, title, offerDetails, amountOffered, resourcesOffered } = req.body;

    const project = await Project.findById(projectId).populate('teamLeader');
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    // Resolve or find Organization
    let org = await Organization.findOne({
      $or: [
        { contactEmail: req.user.email },
        { name: req.user.organizationName || 'Tata Steel Foundation' },
      ],
    });

    if (!org) {
      org = await Organization.create({
        name: req.user.organizationName || 'Industry Partner CSR',
        contactEmail: req.user.email,
        district: req.user.district || 'Jamshedpur',
        industrySector: 'Manufacturing & CSR Initiatives',
      });
    }

    const collaboration = await CollaborationRequest.create({
      project: project._id,
      organization: org._id,
      sender: req.user.id,
      type: type || 'FUNDING',
      title: title || `Partnership Proposal for ${project.title}`,
      offerDetails,
      amountOffered: amountOffered ? Number(amountOffered) : 0,
      resourcesOffered: Array.isArray(resourcesOffered) ? resourcesOffered : [resourcesOffered].filter(Boolean),
      status: 'PENDING',
    });

    // Notify project team leader
    try {
      await Notification.create({
        recipient: project.teamLeader._id,
        title: 'New Industry Partnership Offer!',
        message: `${org.name} offered ${type}: "${collaboration.title}"`,
        link: `/projects/${project._id}`,
        type: 'COLLABORATION',
      });
    } catch (notifErr) {
      // Non-blocking
    }

    res.status(201).json({
      success: true,
      message: 'Collaboration proposal submitted to the university team.',
      collaboration,
    });
  } catch (error) {
    console.error('Create collaboration error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/collaborations/project/:projectId
const getProjectCollaborations = async (req, res) => {
  try {
    const collaborations = await CollaborationRequest.find({ project: req.params.projectId })
      .populate('organization')
      .populate('sender', 'name email role organizationName')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      collaborations,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/collaborations/my
const getMyCollaborations = async (req, res) => {
  try {
    const collaborations = await CollaborationRequest.find({ sender: req.user.id })
      .populate({
        path: 'project',
        populate: [
          { path: 'challenge', select: 'title district category' },
          { path: 'university', select: 'name' },
        ],
      })
      .populate('organization')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      collaborations,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/collaborations/:id/status
const updateCollaborationStatus = async (req, res) => {
  try {
    const { status, responseNotes } = req.body;
    const collaboration = await CollaborationRequest.findById(req.params.id);

    if (!collaboration) {
      return res.status(404).json({ success: false, message: 'Collaboration request not found.' });
    }

    collaboration.status = status;
    if (responseNotes) collaboration.responseNotes = responseNotes;
    await collaboration.save();

    // If accepted and amount offered, increment project funded budget
    if (status === 'ACCEPTED' && collaboration.amountOffered > 0) {
      const project = await Project.findById(collaboration.project);
      if (project) {
        project.budgetFunded = (project.budgetFunded || 0) + collaboration.amountOffered;
        await project.save();
      }
    }

    // Notify industry partner
    try {
      await Notification.create({
        recipient: collaboration.sender,
        title: `Collaboration Update: ${status}`,
        message: `Your partnership request has been marked as ${status}.`,
        link: `/industry/partnerships`,
        type: 'SUCCESS',
      });
    } catch (notifErr) {
      // Non-blocking
    }

    res.json({
      success: true,
      message: `Collaboration request marked as ${status}.`,
      collaboration,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createCollaboration,
  getProjectCollaborations,
  getMyCollaborations,
  updateCollaborationStatus,
};
