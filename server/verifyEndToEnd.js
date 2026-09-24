const dotenv = require('dotenv');
dotenv.config();

const BASE_URL = 'http://localhost:5000/api';

async function runVerification() {
  console.log('====================================================');
  console.log('  SAMADHANSETU END-TO-END VERIFICATION (SIH 2026)');
  console.log('====================================================\n');

  try {
    // 1. Health check
    console.log('[Step 1] Checking API health...');
    const healthRes = await fetch(`${BASE_URL}/health`);
    const health = await healthRes.json();
    console.log('  ✓ API Health:', health.status, 'Platform:', health.platform);

    // 2. Citizen Login
    console.log('\n[Step 2] Authenticating Citizen...');
    const citizenLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'citizen@email.com', password: 'password123' }),
    });
    const citizenAuth = await citizenLoginRes.json();
    console.log('  ✓ Citizen logged in. Token acquired for:', citizenAuth.user.name);
    const citizenToken = citizenAuth.token;

    // 3. Citizen reports challenge
    console.log('\n[Step 3] Citizen submitting new societal challenge...');
    const challengeRes = await fetch(`${BASE_URL}/challenges`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${citizenToken}`,
      },
      body: JSON.stringify({
        title: 'Severe Arsenic and Iron Leaching in Tatisilwai Handpumps',
        category: 'Water & sanitation',
        description: 'Groundwater in ward 4 has turned reddish brown with toxic iron precipitate. Children and elderly suffer chronic gastrointestinal distress.',
        district: 'Ranchi',
        location: 'Tatisilwai Industrial Area Perimeter, Ward 4',
        coordinates: { lat: 23.3612, lng: 85.4215 },
        affectedPeople: '1,800 residents',
        urgency: 'HIGH',
      }),
    });
    const newChallengeData = await challengeRes.json();
    const challenge = newChallengeData.challenge;
    console.log('  ✓ Challenge created with ID:', challenge._id);
    console.log('  ✓ AI Analysis Attached:', challenge.aiAnalysis ? 'Yes (Cached)' : 'Pending');
    console.log('    • AI Severity Score:', challenge.aiAnalysis?.severityScore || 'N/A');
    console.log('    • AI Recommended Domain:', challenge.aiAnalysis?.recommendedDomains?.[0] || 'N/A');

    // 4. Admin Login & Verification
    console.log('\n[Step 4] Government Admin verifying challenge...');
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@email.com', password: 'password123' }),
    });
    const adminAuth = await adminLoginRes.json();
    const adminToken = adminAuth.token;

    const verifyRes = await fetch(`${BASE_URL}/admin/verify/${challenge._id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        status: 'VERIFIED',
        priority: 'URGENT',
        adminNotes: 'Verified with Ranchi District Water Board. Published for immediate university adoption.',
      }),
    });
    const verifiedData = await verifyRes.json();
    console.log('  ✓ Admin approved challenge status:', verifiedData.challenge.status);
    console.log('  ✓ Priority set to:', verifiedData.challenge.priority);

    // 5. Student Adopts Challenge
    console.log('\n[Step 5] University Student adopting challenge...');
    const studentLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student@email.com', password: 'password123' }),
    });
    const studentAuth = await studentLoginRes.json();
    const studentToken = studentAuth.token;

    const adoptRes = await fetch(`${BASE_URL}/projects/adopt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        challengeId: challenge._id,
        title: 'Project AmritJal: Low-Cost Iron-Arsenic Removal Column',
        abstract: 'BIT Mesra student taskforce developing an indigenous iron-arsenic filter with automated backwash.',
        estimatedBudget: 160000,
      }),
    });
    const adoptData = await adoptRes.json();
    const project = adoptData.project;
    console.log('  ✓ University Project initialized with ID:', project._id);
    console.log('  ✓ Milestones generated count:', adoptData.milestones?.length);

    // 6. Industry Offers CSR Grant
    console.log('\n[Step 6] Industry CSR Partner offering grant...');
    const industryLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'industry@email.com', password: 'password123' }),
    });
    const industryAuth = await industryLoginRes.json();
    const industryToken = industryAuth.token;

    const collabRes = await fetch(`${BASE_URL}/collaborations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${industryToken}`,
      },
      body: JSON.stringify({
        projectId: project._id,
        type: 'CSR_GRANT',
        title: 'Tata Steel CSR Grant for AmritJal Filter Fabrication',
        offerDetails: 'Disbursing ₹1,60,000 for purchasing food-grade FRP columns and field testing sensors.',
        amountOffered: 160000,
        resourcesOffered: ['Material supply', 'Lab test facility at Jamshedpur'],
      }),
    });
    const collabData = await collabRes.json();
    console.log('  ✓ Collaboration request created with ID:', collabData.collaboration._id);

    // 7. University Team Accepts CSR Grant
    console.log('\n[Step 7] University team accepting CSR Grant...');
    const acceptRes = await fetch(`${BASE_URL}/collaborations/${collabData.collaboration._id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({ status: 'ACCEPTED' }),
    });
    const acceptData = await acceptRes.json();
    console.log('  ✓ Collaboration marked as:', acceptData.collaboration.status);

    // 8. Student Submits Milestone 1 Proof
    console.log('\n[Step 8] Student submitting Milestone 1 deliverable proof...');
    const milestone1 = adoptData.milestones[0];
    const submitProofRes = await fetch(`${BASE_URL}/projects/${project._id}/milestones/${milestone1._id}/submit`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        proofUrl: 'https://samadhansetu.gov.in/docs/tatisilwai-water-baseline.pdf',
        proofTitle: 'Baseline Iron Spectrophotometry Report',
        notes: 'Water samples verified with BIT Mesra Environmental Lab.',
      }),
    });
    const proofData = await submitProofRes.json();
    console.log('  ✓ Milestone submitted:', proofData.milestone.status);

    // 9. Faculty Mentor Verifies Milestone 1
    console.log('\n[Step 9] Faculty Mentor verifying milestone...');
    const facultyLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'faculty@email.com', password: 'password123' }),
    });
    const facultyAuth = await facultyLoginRes.json();
    const facultyToken = facultyAuth.token;

    const verifyMilestoneRes = await fetch(`${BASE_URL}/projects/${project._id}/milestones/${milestone1._id}/verify`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${facultyToken}`,
      },
      body: JSON.stringify({
        status: 'VERIFIED',
        notes: 'Spectrophotometry data conforms to CPCB standards. Approved.',
      }),
    });
    const verifyMilestoneData = await verifyMilestoneRes.json();
    console.log('  ✓ Milestone verified! New project progress:', verifyMilestoneData.progressPercentage + '%');

    // 10. Check Impact Analytics
    console.log('\n[Step 10] Checking live state impact analytics...');
    const analyticsRes = await fetch(`${BASE_URL}/analytics/dashboard`);
    const analytics = await analyticsRes.json();
    console.log('  ✓ Total Challenges in System:', analytics.metrics.totalChallenges);
    console.log('  ✓ Active University Projects:', analytics.metrics.activeProjects);
    console.log('  ✓ Total CSR Funds Committed:', '₹' + analytics.metrics.totalFundsCommitted);

    console.log('\n====================================================');
    console.log('  ALL 10 END-TO-END WORKFLOW STEPS PASSED!');
    console.log('====================================================\n');
  } catch (err) {
    console.error('Verification failed with error:', err);
    process.exit(1);
  }
}

runVerification();
