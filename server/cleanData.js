const dotenv = require('dotenv');
dotenv.config();

const { connectDB } = require('./config/db');
const User = require('./models/User');
const Challenge = require('./models/Challenge');
const ChallengeAIAnalysis = require('./models/ChallengeAIAnalysis');
const Project = require('./models/Project');
const Team = require('./models/Team');
const Milestone = require('./models/Milestone');
const CollaborationRequest = require('./models/CollaborationRequest');
const Notification = require('./models/Notification');
const OtpVerification = require('./models/OtpVerification');
const University = require('./models/University');
const Organization = require('./models/Organization');

async function cleanData() {
  try {
    await connectDB();

    console.log('[Cleanup] Preserving all User accounts...');
    const userCount = await User.countDocuments();
    console.log(`[Cleanup] Existing users found: ${userCount}`);

    console.log('[Cleanup] Deleting all reported challenges, AI analyses, projects, teams, milestones, and notifications...');
    const [cDel, aDel, pDel, tDel, mDel, colDel, nDel, oDel] = await Promise.all([
      Challenge.deleteMany({}),
      ChallengeAIAnalysis.deleteMany({}),
      Project.deleteMany({}),
      Team.deleteMany({}),
      Milestone.deleteMany({}),
      CollaborationRequest.deleteMany({}),
      Notification.deleteMany({}),
      OtpVerification.deleteMany({}),
    ]);

    // Reset project counters in University & Organization
    await University.updateMany({}, { activeProjectsCount: 0, completedProjectsCount: 0 });
    await Organization.updateMany({}, { activePartnershipsCount: 0 });

    console.log(`[Cleanup] Results:`);
    console.log(`  - Challenges deleted: ${cDel.deletedCount}`);
    console.log(`  - AI Analyses deleted: ${aDel.deletedCount}`);
    console.log(`  - Projects deleted: ${pDel.deletedCount}`);
    console.log(`  - Teams deleted: ${tDel.deletedCount}`);
    console.log(`  - Milestones deleted: ${mDel.deletedCount}`);
    console.log(`  - Collaborations deleted: ${colDel.deletedCount}`);
    console.log(`  - Notifications deleted: ${nDel.deletedCount}`);
    console.log(`  - Users kept intact: ${userCount}`);
    console.log('[Cleanup] Data cleanup finished successfully.');
    process.exit(0);
  } catch (err) {
    console.error('[Cleanup] Failed:', err);
    process.exit(1);
  }
}

cleanData();
