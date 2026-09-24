const Project = require('../models/Project');
const Challenge = require('../models/Challenge');
const Team = require('../models/Team');
const Milestone = require('../models/Milestone');
const University = require('../models/University');
const Notification = require('../models/Notification');

// POST /api/projects/adopt
const adoptChallenge = async (req, res) => {
  try {
    const { challengeId, title, abstract, estimatedBudget, methodology, expectedOutcome } = req.body;

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found.' });
    }

    if (challenge.project) {
      return res.status(400).json({ success: false, message: 'This challenge has already been adopted by a project team.' });
    }

    // Resolve university reference from user or request
    let universityId = req.user.university;
    if (!universityId) {
      // Find university matching user's universityName or fallback to BIT Mesra
      const uni = await University.findOne({
        $or: [
          { name: { $regex: req.user.universityName || 'BIT Mesra', $options: 'i' } },
          { district: req.user.district },
        ],
      }) || await University.findOne();
      universityId = uni ? uni._id : null;
    }

    const project = await Project.create({
      title: title || `Solution Project: ${challenge.title}`,
      abstract: abstract || `Collaborative technical development to solve "${challenge.title}" in ${challenge.district}.`,
      challenge: challenge._id,
      university: universityId,
      teamLeader: req.user.id,
      facultyMentor: req.user.role === 'university' ? req.user.id : null,
      budgetEstimated: estimatedBudget || 120000,
      currentPhase: 'RESEARCH',
      status: 'ACTIVE',
      progressPercentage: 10,
      proposalDoc: {
        title: 'Project Inception & Architecture Plan',
        methodology: methodology || 'Field requirement gathering, low-cost prototype fabrication, and localized pilot deployment.',
        expectedOutcome: expectedOutcome || `Measurable resolution for ${challenge.affectedPeople} in ${challenge.district}.`,
        submittedAt: new Date(),
      },
    });

    // Create Team
    const team = await Team.create({
      name: `${challenge.category} Solution Taskforce`,
      project: project._id,
      leader: req.user.id,
      facultyMentor: req.user.role === 'university' ? req.user.id : null,
      studentMembers: [
        {
          user: req.user.id,
          roleInTeam: req.user.role === 'student' ? 'Student Lead' : 'Faculty Principal Investigator',
        },
      ],
    });

    // Create standard 3 milestones to jumpstart tracking
    const target1 = new Date(); target1.setDate(target1.getDate() + 15);
    const target2 = new Date(); target2.setDate(target2.getDate() + 45);
    const target3 = new Date(); target3.setDate(target3.getDate() + 90);

    const m1 = await Milestone.create({
      project: project._id,
      title: 'Milestone 1: Field Assessment & Requirement Baseline',
      description: 'On-site survey with affected citizens, technical specifications, and feasibility study.',
      order: 1,
      targetDate: target1,
      status: 'IN_PROGRESS',
    });

    const m2 = await Milestone.create({
      project: project._id,
      title: 'Milestone 2: Prototype Fabrication & Lab Validation',
      description: 'Fabricate functional prototype unit and test under simulated district conditions.',
      order: 2,
      targetDate: target2,
      status: 'PENDING',
    });

    const m3 = await Milestone.create({
      project: project._id,
      title: 'Milestone 3: Pilot Deployment & Community Handover',
      description: 'Deploy solution at community site, measure impact, and provide operational guidelines.',
      order: 3,
      targetDate: target3,
      status: 'PENDING',
    });

    // Update challenge status
    challenge.status = 'IN_PROGRESS';
    challenge.project = project._id;
    if (universityId) {
      challenge.assignedUniversity = universityId;
    }
    await challenge.save();

    // Notify citizen that university adopted their challenge
    try {
      await Notification.create({
        recipient: challenge.submittedBy,
        title: 'Challenge Adopted by University Team!',
        message: `Your challenge "${challenge.title}" has been adopted by ${req.user.universityName || 'a University Innovation Team'}. Work has commenced!`,
        link: `/challenges/${challenge._id}`,
        type: 'SUCCESS',
      });
    } catch (notifErr) {
      // Non-blocking
    }

    res.status(201).json({
      success: true,
      message: 'Challenge adopted successfully and project initialized.',
      project,
      team,
      milestones: [m1, m2, m3],
    });
  } catch (error) {
    console.error('Adopt challenge error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/projects
const getAllProjects = async (req, res) => {
  try {
    const { phase, status, search } = req.query;
    const filter = {};

    if (phase && phase !== 'All') filter.currentPhase = phase;
    if (status && status !== 'All') filter.status = status;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { abstract: { $regex: search, $options: 'i' } },
      ];
    }

    const projects = await Project.find(filter)
      .populate('challenge', 'title district category urgency status coordinates')
      .populate('university', 'name district logo')
      .populate('teamLeader', 'name email role department')
      .populate('facultyMentor', 'name email role department')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      projects,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/projects/:id
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('challenge')
      .populate('university')
      .populate('teamLeader', 'name email phone role department')
      .populate('facultyMentor', 'name email phone role department');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const [team, milestones] = await Promise.all([
      Team.findOne({ project: project._id }).populate('studentMembers.user', 'name email role department skills'),
      Milestone.find({ project: project._id }).sort({ order: 1 }),
    ]);

    res.json({
      success: true,
      project,
      team,
      milestones,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/projects/my
const getMyProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { teamLeader: req.user.id },
        { facultyMentor: req.user.id },
      ],
    })
      .populate('challenge', 'title district category urgency status')
      .populate('university', 'name district')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      projects,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/projects/:id/milestones
const addMilestone = async (req, res) => {
  try {
    const { title, description, targetDate, order } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const count = await Milestone.countDocuments({ project: project._id });
    const milestone = await Milestone.create({
      project: project._id,
      title,
      description: description || '',
      order: order || count + 1,
      targetDate: targetDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'PENDING',
    });

    res.status(201).json({ success: true, milestone });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/projects/:id/milestones/:milestoneId/submit
const submitMilestoneProof = async (req, res) => {
  try {
    const { proofUrl, proofTitle, notes } = req.body;
    const milestone = await Milestone.findById(req.params.milestoneId);
    if (!milestone) {
      return res.status(404).json({ success: false, message: 'Milestone not found.' });
    }

    milestone.status = 'SUBMITTED';
    milestone.completionDate = new Date();
    if (proofUrl) {
      milestone.proofAttachments.push({
        title: proofTitle || 'Milestone Proof Document',
        url: proofUrl,
        type: 'document',
      });
    }
    if (notes) {
      milestone.verificationNotes = notes;
    }
    await milestone.save();

    res.json({ success: true, message: 'Milestone submitted for faculty/admin review.', milestone });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/projects/:id/milestones/:milestoneId/verify
const verifyMilestone = async (req, res) => {
  try {
    const { status, notes } = req.body; // VERIFIED or REJECTED
    const milestone = await Milestone.findById(req.params.milestoneId);
    if (!milestone) {
      return res.status(404).json({ success: false, message: 'Milestone not found.' });
    }

    milestone.status = status || 'VERIFIED';
    milestone.verifiedBy = req.user.id;
    milestone.verifiedAt = new Date();
    if (notes) milestone.verificationNotes = notes;
    await milestone.save();

    // Recalculate project progress
    const allMilestones = await Milestone.find({ project: milestone.project });
    const verifiedCount = allMilestones.filter((m) => m.status === 'VERIFIED').length;
    const newProgress = Math.round((verifiedCount / allMilestones.length) * 100);

    const project = await Project.findById(milestone.project);
    if (project) {
      project.progressPercentage = newProgress;
      if (newProgress >= 100) {
        project.currentPhase = 'RESOLVED';
        project.status = 'COMPLETED';
        // Also update challenge status to RESOLVED
        await Challenge.findByIdAndUpdate(project.challenge, {
          status: 'RESOLVED',
          resolvedAt: new Date(),
        });
      } else if (newProgress >= 65) {
        project.currentPhase = 'PILOT_DEPLOYMENT';
        await Challenge.findByIdAndUpdate(project.challenge, { status: 'PILOTING' });
      } else if (newProgress >= 30) {
        project.currentPhase = 'PROTOTYPING';
        await Challenge.findByIdAndUpdate(project.challenge, { status: 'SOLUTION_SUBMITTED' });
      }
      await project.save();
    }

    res.json({
      success: true,
      message: `Milestone has been ${status.toLowerCase()}. Project progress updated to ${newProgress}%.`,
      milestone,
      progressPercentage: newProgress,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/projects/:id/team-members
const addTeamMember = async (req, res) => {
  try {
    const { studentEmail, roleInTeam } = req.body;
    const student = await User.findOne({ email: studentEmail.toLowerCase() });
    if (!student) {
      return res.status(404).json({ success: false, message: 'User with this email not found.' });
    }

    let team = await Team.findOne({ project: req.params.id });
    if (!team) {
      team = await Team.create({
        project: req.params.id,
        leader: req.user.id,
        studentMembers: [],
      });
    }

    const alreadyMember = team.studentMembers.some((m) => m.user.toString() === student._id.toString());
    if (alreadyMember) {
      return res.status(400).json({ success: false, message: 'User is already a team member.' });
    }

    team.studentMembers.push({
      user: student._id,
      roleInTeam: roleInTeam || 'Researcher & Developer',
    });
    await team.save();

    res.json({ success: true, message: 'Team member added.', team });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  adoptChallenge,
  getAllProjects,
  getProjectById,
  getMyProjects,
  addMilestone,
  submitMilestoneProof,
  verifyMilestone,
  addTeamMember,
};
