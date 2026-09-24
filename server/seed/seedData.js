const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('dns');

// Public DNS to fix Windows SRV DNS resolution for MongoDB Atlas
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore if not allowed
}

dotenv.config();

const User = require('../models/User');
const Challenge = require('../models/Challenge');
const ChallengeAIAnalysis = require('../models/ChallengeAIAnalysis');
const University = require('../models/University');
const Organization = require('../models/Organization');
const Project = require('../models/Project');
const Team = require('../models/Team');
const Milestone = require('../models/Milestone');
const CollaborationRequest = require('../models/CollaborationRequest');
const Notification = require('../models/Notification');
const OtpVerification = require('../models/OtpVerification');
const { connectDB } = require('../config/db');

const seedData = async () => {
  try {
    console.log('[Seed] Starting database cleanup and seeding...');

    // 1. Clear all existing data
    await Promise.all([
      User.deleteMany({}),
      Challenge.deleteMany({}),
      ChallengeAIAnalysis.deleteMany({}),
      University.deleteMany({}),
      Organization.deleteMany({}),
      Project.deleteMany({}),
      Team.deleteMany({}),
      Milestone.deleteMany({}),
      CollaborationRequest.deleteMany({}),
      Notification.deleteMany({}),
      OtpVerification.deleteMany({}),
    ]);

    console.log('[Seed] All existing users, challenges, projects, teams, and data cleared.');

    // 2. Setup standard accredited universities & organizations for reference
    const universities = await University.create([
      {
        name: 'Birla Institute of Technology (BIT) Mesra',
        code: 'BITM-01',
        district: 'Ranchi',
        state: 'Jharkhand',
        domains: ['Computer Science & AI', 'Civil & Environmental Engineering', 'Mechanical & IoT', 'Biotechnology'],
        contactEmail: 'contact@bitmesra.ac.in',
        facultyCount: 220,
        studentCount: 7500,
        activeProjectsCount: 0,
        description: 'Premier technical institute known for research in water purification, rural energy, and satellite GIS.',
      },
      {
        name: 'Indian Institute of Technology (ISM) Dhanbad',
        code: 'IITISM-02',
        district: 'Dhanbad',
        state: 'Jharkhand',
        domains: ['Mining & Environmental Sciences', 'Hydrology & Groundwater', 'Applied Geology'],
        contactEmail: 'contact@iitism.ac.in',
        facultyCount: 310,
        studentCount: 8200,
        activeProjectsCount: 0,
        description: 'National institute of excellence specializing in mineral ecology, air quality monitoring, and water contamination remediation.',
      },
      {
        name: 'National Institute of Technology (NIT) Jamshedpur',
        code: 'NITJSR-03',
        district: 'Jamshedpur',
        state: 'Jharkhand',
        domains: ['Materials & Metallurgical Engineering', 'Electrical & Renewable Systems', 'Robotics & Automation'],
        contactEmail: 'academics@nitjsr.ac.in',
        facultyCount: 190,
        studentCount: 5400,
        activeProjectsCount: 0,
        description: 'Leading NIT with strong industrial collaboration ties in East Singhbhum manufacturing belt.',
      },
    ]);

    const organizations = await Organization.create([
      {
        name: 'Tata Steel Foundation',
        type: 'CSR',
        industrySector: 'Manufacturing, Urban Development & Rural Livelihoods',
        district: 'Jamshedpur',
        state: 'Jharkhand',
        contactEmail: 'csr@tatasteel.com',
        contactPerson: 'Industry CSR Lead',
        fundingBudgetAvailable: 5000000,
        activePartnershipsCount: 0,
        description: 'Corporate social responsibility foundation driving water security, education, and rural development across Jharkhand.',
      },
      {
        name: 'Bharat Coking Coal Limited (BCCL CSR)',
        type: 'Industry',
        industrySector: 'Mining & Environmental Remediation',
        district: 'Dhanbad',
        state: 'Jharkhand',
        contactEmail: 'csr@bccl.gov.in',
        contactPerson: 'BCCL CSR Head',
        fundingBudgetAvailable: 3000000,
        activePartnershipsCount: 0,
        description: 'Focusing on mine water utilization and ambient environmental sustainability in Jharkhand.',
      },
    ]);

    const bitMesra = universities[0];
    const nitJsr = universities[2];
    const tataSteel = organizations[0];

    // 3. Create fresh clean users with password "password123"
    // Password will be securely hashed by User model pre('save') hook
    const cleanUsers = [
      {
        name: 'Citizen',
        email: 'citizen@email.com',
        password: 'password123',
        role: 'citizen',
        isEmailVerified: true,
        phone: '+91 98000 00001',
        district: 'Ranchi',
        state: 'Jharkhand',
      },
      {
        name: 'Student',
        email: 'student@email.com',
        password: 'password123',
        role: 'student',
        isEmailVerified: true,
        phone: '+91 98000 00002',
        district: 'Ranchi',
        state: 'Jharkhand',
        university: bitMesra._id,
        universityName: bitMesra.name,
        department: 'Computer Science & Engineering',
      },
      {
        name: 'Faculty',
        email: 'faculty@email.com',
        password: 'password123',
        role: 'university',
        isEmailVerified: true,
        phone: '+91 98000 00003',
        district: 'Jamshedpur',
        state: 'Jharkhand',
        university: nitJsr._id,
        universityName: nitJsr.name,
        department: 'Engineering & Technology',
        designation: 'Faculty Mentor',
      },
      {
        name: 'University',
        email: 'university@email.com',
        password: 'password123',
        role: 'university',
        isEmailVerified: true,
        phone: '+91 98000 00004',
        district: 'Ranchi',
        state: 'Jharkhand',
        university: bitMesra._id,
        universityName: bitMesra.name,
        department: 'Academic & Research Cell',
        designation: 'University Representative',
      },
      {
        name: 'Industry',
        email: 'industry@email.com',
        password: 'password123',
        role: 'industry',
        isEmailVerified: true,
        phone: '+91 98000 00005',
        district: 'Jamshedpur',
        state: 'Jharkhand',
        organization: tataSteel._id,
        organizationName: tataSteel.name,
        designation: 'CSR Lead',
      },
      {
        name: 'Admin',
        email: 'admin@email.com',
        password: 'password123',
        role: 'admin',
        isEmailVerified: true,
        phone: '+91 98000 00006',
        district: 'Ranchi',
        state: 'Jharkhand',
        department: 'Dept. of Higher Education & IT, Govt. of Jharkhand',
        designation: 'Platform Administrator',
      },
    ];

    for (const u of cleanUsers) {
      await User.create(u);
    }

    console.log(`[Seed] Successfully created ${cleanUsers.length} clean user accounts:`);
    cleanUsers.forEach((u) => console.log(`  - ${u.email} (${u.role}) [password: password123]`));
    console.log('[Seed] Database is clean and ready.');
    return true;
  } catch (err) {
    console.error('[Seed] Error during seeding:', err);
    throw err;
  }
};

// If run directly via `node seed/seedData.js`
if (require.main === module) {
  connectDB().then(async () => {
    await seedData();
    console.log('[Seed] Seeding complete. Exiting...');
    process.exit(0);
  }).catch((err) => {
    console.error('[Seed] Script failure:', err);
    process.exit(1);
  });
}

module.exports = seedData;
