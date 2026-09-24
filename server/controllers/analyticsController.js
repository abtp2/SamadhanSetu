const Challenge = require('../models/Challenge');
const Project = require('../models/Project');
const University = require('../models/University');
const Organization = require('../models/Organization');
const CollaborationRequest = require('../models/CollaborationRequest');

// GET /api/analytics/dashboard
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalChallenges,
      verifiedChallenges,
      activeProjects,
      resolvedChallenges,
      universitiesCount,
      organizationsCount,
      allChallenges,
      allProjects,
      collaborations,
    ] = await Promise.all([
      Challenge.countDocuments(),
      Challenge.countDocuments({ status: { $in: ['VERIFIED', 'ASSIGNED', 'IN_PROGRESS', 'SOLUTION_SUBMITTED', 'PILOTING', 'IMPLEMENTED', 'RESOLVED'] } }),
      Project.countDocuments({ status: 'ACTIVE' }),
      Challenge.countDocuments({ status: { $in: ['IMPLEMENTED', 'RESOLVED'] } }),
      University.countDocuments(),
      Organization.countDocuments(),
      Challenge.find().select('category district status urgency createdAt'),
      Project.find().select('currentPhase progressPercentage budgetEstimated budgetFunded beneficiaryCount'),
      CollaborationRequest.find().select('type amountOffered status'),
    ]);

    // Category breakdown
    const categoryCounts = {};
    allChallenges.forEach((c) => {
      categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
    });
    const categoryDistribution = Object.keys(categoryCounts).map((cat) => ({
      name: cat,
      count: categoryCounts[cat],
    }));

    // District breakdown
    const districtCounts = {};
    allChallenges.forEach((c) => {
      districtCounts[c.district] = (districtCounts[c.district] || 0) + 1;
    });
    const districtDistribution = Object.keys(districtCounts).map((dist) => ({
      name: dist,
      count: districtCounts[dist],
    }));

    // Phase distribution
    const phaseCounts = {
      RESEARCH: 0,
      PROTOTYPING: 0,
      TESTING: 0,
      PILOT_DEPLOYMENT: 0,
      IMPLEMENTED: 0,
      RESOLVED: 0,
    };
    allProjects.forEach((p) => {
      if (phaseCounts[p.currentPhase] !== undefined) {
        phaseCounts[p.currentPhase]++;
      }
    });

    const phaseDistribution = Object.keys(phaseCounts).map((phase) => ({
      phase,
      count: phaseCounts[phase],
    }));

    // Financial & Impact Aggregates
    const totalFundsCommitted = collaborations
      .filter((c) => c.status === 'ACCEPTED')
      .reduce((sum, c) => sum + (c.amountOffered || 0), 0);

    const totalBeneficiaries = allProjects.reduce((sum, p) => sum + (p.beneficiaryCount || 0), 0);

    res.json({
      success: true,
      metrics: {
        totalChallenges,
        verifiedChallenges,
        activeProjects,
        resolvedChallenges,
        universitiesCount,
        organizationsCount,
        totalFundsCommitted,
        totalBeneficiaries,
      },
      categoryDistribution,
      districtDistribution,
      phaseDistribution,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDashboardStats,
};
