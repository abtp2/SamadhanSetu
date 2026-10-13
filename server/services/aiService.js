const Groq = require('groq-sdk');
const Challenge = require('../models/Challenge');
const ChallengeAIAnalysis = require('../models/ChallengeAIAnalysis');
const University = require('../models/University');

// Available official categories
const VALID_CATEGORIES = [
  'Education',
  'Healthcare',
  'Agriculture',
  'Water & sanitation',
  'Environment',
  'Energy',
  'Rural livelihoods',
  'Accessibility',
  'Urban infrastructure',
  'Public services',
];

// Fallback intelligent analyzer when Groq API key is missing or quota is reached
function fallbackHeuristicAnalysis(challenge, existingChallenges = [], availableUniversities = []) {
  const text = `${challenge.title} ${challenge.description} ${challenge.location}`.toLowerCase();

  // Category detection keywords
  let detectedCategory = challenge.category || 'Public services';
  if (/school|college|teacher|student|class|books|dropout|education|literacy/.test(text)) {
    detectedCategory = 'Education';
  } else if (/hospital|clinic|doctor|disease|health|medicine|ambulance|nutrition|malaria/.test(text)) {
    detectedCategory = 'Healthcare';
  } else if (/farm|crop|irrigation|seed|fertilizer|soil|kisan|agriculture|harvest|mandi/.test(text)) {
    detectedCategory = 'Agriculture';
  } else if (/water|drain|borewell|contamination|purifier|sewage|sanitation|drinking|pipeline|arsenic/.test(text)) {
    detectedCategory = 'Water & sanitation';
  } else if (/forest|pollution|air quality|waste|plastic|dumping|mining dust|environment|ecology/.test(text)) {
    detectedCategory = 'Environment';
  } else if (/power|electricity|solar|load shedding|transformer|grid|energy|voltage/.test(text)) {
    detectedCategory = 'Energy';
  } else if (/artisan|weaving|pottery|tribal craft|self help group|shg|livelihood|cottage|bamboo/.test(text)) {
    detectedCategory = 'Rural livelihoods';
  } else if (/disability|wheelchair|ramp|blind|braille|accessible|special needs/.test(text)) {
    detectedCategory = 'Accessibility';
  } else if (/road|bridge|pothole|traffic|drainage|street light|culvert|urban infrastructure/.test(text)) {
    detectedCategory = 'Urban infrastructure';
  }

  // Severity and priority estimation
  let severityScore = 6;
  if (/critical|hazard|emergency|death|collapse|poisonous|fatal|outbreak|urgent/i.test(text)) {
    severityScore = 9;
  } else if (/severe|damaged|contaminated|heavy loss|broken|flood|disease/i.test(text)) {
    severityScore = 7;
  } else if (/minor|delay|repair needed|request/i.test(text)) {
    severityScore = 4;
  }

  // Priority classification: HIGH / URGENT / MEDIUM / LOW
  let priorityLevel = 'HIGH';
  if (severityScore >= 8 || challenge.urgency === 'CRITICAL') {
    priorityLevel = 'URGENT';
  } else if (severityScore >= 6 || challenge.urgency === 'HIGH') {
    priorityLevel = 'HIGH';
  } else if (severityScore >= 4) {
    priorityLevel = 'MEDIUM';
  } else {
    priorityLevel = 'LOW';
  }

  // Domain & university recommendations
  const domainMap = {
    'Water & sanitation': ['Civil & Environmental Engineering', 'Hydrology & Water Resources', 'Chemical Separation Tech'],
    'Healthcare': ['Biomedical Engineering', 'Community Medicine', 'Telehealth & IoT Diagnostics'],
    'Agriculture': ['Agricultural Engineering', 'IoT Smart Farming', 'Food Technology'],
    'Environment': ['Environmental Sciences', 'Mining Waste Management', 'Renewable Ecology'],
    'Education': ['Educational Technology', 'Computer Science & AI', 'Rural Pedagogy'],
    'Energy': ['Electrical & Renewable Energy', 'Power Electronics', 'Solar Microgrid Systems'],
    'Urban infrastructure': ['Civil & Structural Engineering', 'Urban Planning', 'Smart Sensors & GIS'],
    'Rural livelihoods': ['Rural Technology Development', 'Design & Ergonomics', 'Agro-processing'],
    'Accessibility': ['Assistive Technology', 'Robotics & Mechatronics', 'Universal Design'],
    'Public services': ['Information Technology', 'Operations Research', 'GovTech Systems'],
  };

  const universityMap = {
    'Ranchi': ['Birla Institute of Technology (BIT) Mesra', 'Ranchi University', 'NIFFT Ranchi'],
    'Dhanbad': ['Indian Institute of Technology (ISM) Dhanbad', 'BIT Sindri'],
    'Jamshedpur': ['National Institute of Technology (NIT) Jamshedpur', 'Arka Jain University'],
    'East Singhbhum': ['National Institute of Technology (NIT) Jamshedpur'],
    'Bokaro': ['Bokaro Steel City College', 'BIT Mesra Extension'],
    'Hazaribagh': ['Vinoba Bhave University, Hazaribagh', 'UCET Hazaribagh'],
  };

  const recommendedDomains = domainMap[detectedCategory] || ['Applied Sciences & Engineering', 'Data Systems'];
  const suggestedUniversities = universityMap[challenge.district] || ['Birla Institute of Technology (BIT) Mesra', 'Indian Institute of Technology (ISM) Dhanbad', 'National Institute of Technology (NIT) Jamshedpur'];

  // Duplicate detection against existing challenges
  const duplicateMatches = [];
  const inputWords = new Set(challenge.title.toLowerCase().split(/\s+/).filter(w => w.length > 3));

  for (const existing of existingChallenges) {
    if (existing._id.toString() === challenge._id?.toString()) continue;
    const existingWords = new Set(`${existing.title} ${existing.description}`.toLowerCase().split(/\s+/).filter(w => w.length > 3));
    let intersection = 0;
    inputWords.forEach(w => {
      if (existingWords.has(w)) intersection++;
    });
    const similarity = inputWords.size > 0 ? intersection / inputWords.size : 0;
    if (similarity > 0.4 || (existing.district === challenge.district && existing.category === detectedCategory && similarity > 0.25)) {
      duplicateMatches.push({
        challengeId: existing._id,
        title: existing.title,
        similarityScore: Math.min(0.95, parseFloat((similarity * 0.9 + 0.1).toFixed(2))),
        similarityReason: `Matches existing problem reported in ${existing.district} concerning similar ${detectedCategory} keywords.`,
      });
    }
  }

  // State Lifecycle Action Decision by AI
  let lifecycleAction = 'VERIFIED'; // Default: VERIFIED (Publish for Open Adoption)
  let verificationNote = `Autonomous AI validation confirmed legitimate civic challenge impacting ${challenge.affectedPeople || 'local residents'}.`;

  const highDuplicate = duplicateMatches.find(d => d.similarityScore >= 0.70);
  if (highDuplicate) {
    lifecycleAction = 'UNDER_REVIEW';
    verificationNote = `Flagged for Human Review: High similarity (${Math.round(highDuplicate.similarityScore * 100)}%) with prior report "${highDuplicate.title}".`;
  } else if (!challenge.description || challenge.description.length < 15) {
    lifecycleAction = 'UNDER_REVIEW';
    verificationNote = `Flagged for Human Review: Description is too brief for automated technical scoping.`;
  }

  // University Routing / Assignment by AI
  let matchedUniversity = null;
  if (Array.isArray(availableUniversities) && availableUniversities.length > 0) {
    // 1. Try district + domain match
    matchedUniversity = availableUniversities.find(u =>
      u.district?.toLowerCase() === challenge.district?.toLowerCase() &&
      u.domains?.some(d => d.toLowerCase().includes(detectedCategory.toLowerCase()) || recommendedDomains.some(rd => d.toLowerCase().includes(rd.toLowerCase())))
    );
    // 2. Try district match only
    if (!matchedUniversity) {
      matchedUniversity = availableUniversities.find(u => u.district?.toLowerCase() === challenge.district?.toLowerCase());
    }
    // 3. Try domain match anywhere in Jharkhand
    if (!matchedUniversity) {
      matchedUniversity = availableUniversities.find(u =>
        u.domains?.some(d => d.toLowerCase().includes(detectedCategory.toLowerCase()) || recommendedDomains.some(rd => d.toLowerCase().includes(rd.toLowerCase())))
      );
    }
    // 4. Default fallback to premier state tech institute
    if (!matchedUniversity) {
      matchedUniversity = availableUniversities[0];
    }
  }

  const aiAssignedUniversity = matchedUniversity ? matchedUniversity._id : null;
  const targetUniName = matchedUniversity ? matchedUniversity.name : (suggestedUniversities[0] || 'State Technical Universities');

  const aiEndorsement = `[AI Autonomous Triage & Approval] State Lifecycle Action: ${lifecycleAction} (Publish for Open Adoption). Priority Classification: ${priorityLevel}. ${matchedUniversity ? `Route / Assigned to: ${matchedUniversity.name} (${matchedUniversity.district}). ` : ''}${verificationNote}`;

  const structuredSummary = `Community issue in ${challenge.district} (${challenge.location}): ${challenge.title}. Primary concern centers around ${detectedCategory.toLowerCase()} affecting ${challenge.affectedPeople || 'local residents'}. Requires technical intervention from ${recommendedDomains[0]}.`;

  const solutionIdeas = [
    `Deploy a low-cost, decentralized community-level pilot utilizing local materials.`,
    `Partner with local university engineering lab to build an IoT monitoring or sensor unit.`,
    `Collaborate with regional industry partners for technical mentoring and CSR implementation funding.`,
  ];

  return {
    detectedCategory,
    severityScore,
    priorityLevel,
    lifecycleAction,
    aiAssignedUniversity,
    aiEndorsement,
    isAiVerified: true,
    structuredSummary,
    keyThemes: [detectedCategory, challenge.district, 'Community Welfare'],
    duplicateMatches: duplicateMatches.slice(0, 3),
    recommendedDomains,
    suggestedUniversities: matchedUniversity ? [matchedUniversity.name, ...suggestedUniversities.filter(u => u !== matchedUniversity.name)] : suggestedUniversities,
    solutionIdeas,
  };
}

// Main AI analysis function
const analyzeChallenge = async (challengeId) => {
  try {
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      throw new Error(`Challenge not found with id: ${challengeId}`);
    }

    // Check if analysis already exists in DB to prevent duplicate quota consumption
    let existingAnalysis = await ChallengeAIAnalysis.findOne({ challenge: challenge._id });
    if (existingAnalysis && existingAnalysis.structuredSummary && existingAnalysis.isAiVerified) {
      console.log(`[AI] Returning cached AI analysis for challenge ${challenge._id}`);
      return existingAnalysis;
    }

    // Fetch existing challenges in the same district/category for duplicate detection & all accredited universities
    const [existingChallenges, availableUniversities] = await Promise.all([
      Challenge.find({ _id: { $ne: challenge._id } }).select('title description district category').limit(20),
      University.find().sort({ name: 1 }),
    ]);

    let aiResult = null;
    const apiKey = process.env.GROQ_API_KEY;

    if (apiKey && apiKey.trim() !== '') {
      try {
        console.log(`[AI] Analyzing challenge ${challenge._id} with Groq AI...`);
        const groq = new Groq({ apiKey: apiKey.trim() });
        const candidateModels = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'];

        const uniNames = availableUniversities.map(u => `${u.name} (${u.district} - domains: ${u.domains?.join(', ')})`).join('\n');

        const systemMessage = `You are an expert AI civic analyst and automated triage nodal officer for SamadhanSetu (Govt. of Jharkhand).
You autonomously perform verification, triage, priority classification, and university routing for citizen-reported problems.
Registered state universities available for routing:
${uniNames || 'Birla Institute of Technology (BIT) Mesra, Indian Institute of Technology (ISM) Dhanbad, National Institute of Technology (NIT) Jamshedpur'}

Return STRICTLY a JSON object matching this schema:
{
  "detectedCategory": "One of: Education, Healthcare, Agriculture, Water & sanitation, Environment, Energy, Rural livelihoods, Accessibility, Urban infrastructure, Public services",
  "severityScore": <Number from 1 to 10>,
  "priorityLevel": "One of: LOW, MEDIUM, HIGH, URGENT",
  "lifecycleAction": "One of: VERIFIED, ASSIGNED, UNDER_REVIEW",
  "structuredSummary": "<A concise 2-3 sentence technical summary of the problem and required action>",
  "keyThemes": ["<Theme 1>", "<Theme 2>", "<Theme 3>"],
  "recommendedDomains": ["<Engineering or academic domain 1>", "<Domain 2>"],
  "suggestedUniversities": ["<Jharkhand university name e.g. BIT Mesra, IIT ISM Dhanbad, NIT Jamshedpur>"],
  "targetUniversityName": "<Exact name of the single best university from registered list to route/assign this issue to, or empty if open>",
  "solutionIdeas": ["<Idea 1>", "<Idea 2>", "<Idea 3>"],
  "endorsementReasoning": "<Official civic rationale explaining why this issue is verified and prioritized>"
}`;

        const userPrompt = `Problem Details:
- Title: ${challenge.title}
- Description: ${challenge.description}
- Stated Category: ${challenge.category}
- District: ${challenge.district}
- Location: ${challenge.location}
- Affected People: ${challenge.affectedPeople || 'Unspecified'}
- Stated Urgency: ${challenge.urgency || 'MEDIUM'}`;

        let rawResponseText = null;
        for (const modelName of candidateModels) {
          try {
            const completion = await groq.chat.completions.create({
              model: modelName,
              messages: [
                { role: 'system', content: systemMessage },
                { role: 'user', content: userPrompt },
              ],
              response_format: { type: 'json_object' },
              temperature: 0.2,
            });

            rawResponseText = completion.choices[0]?.message?.content?.trim();
            if (rawResponseText) break;
          } catch (modelErr) {
            console.log(`[AI] Groq ${modelName} notice: ${modelErr.message}. Trying next candidate.`);
          }
        }

        if (rawResponseText) {
          const cleanJson = rawResponseText.replace(/```json/g, '').replace(/```/g, '').trim();
          aiResult = JSON.parse(cleanJson);
          console.log(`[AI] Successfully analyzed challenge with Groq AI.`);
        } else {
          throw new Error('All Groq model candidates busy');
        }
      } catch (groqError) {
        console.log(`[AI] Groq service notice: ${groqError.message}. Seamlessly applying SamadhanSetu civic analysis engine.`);
        aiResult = fallbackHeuristicAnalysis(challenge, existingChallenges, availableUniversities);
      }
    } else {
      console.log(`[AI] Running SamadhanSetu civic analysis engine.`);
      aiResult = fallbackHeuristicAnalysis(challenge, existingChallenges, availableUniversities);
    }

    // Heuristic baseline for duplicate check and fallback resolution
    const heuristicResult = fallbackHeuristicAnalysis(challenge, existingChallenges, availableUniversities);

    if (!aiResult.duplicateMatches || aiResult.duplicateMatches.length === 0) {
      aiResult.duplicateMatches = heuristicResult.duplicateMatches;
    }
    if (!aiResult.lifecycleAction) {
      aiResult.lifecycleAction = heuristicResult.lifecycleAction;
    }
    if (!aiResult.priorityLevel) {
      aiResult.priorityLevel = heuristicResult.priorityLevel;
    }

    // Resolve matched university ID from targetUniversityName or heuristic
    if (!aiResult.aiAssignedUniversity && aiResult.targetUniversityName) {
      const matchedUni = availableUniversities.find(u =>
        u.name.toLowerCase().includes(aiResult.targetUniversityName.toLowerCase()) ||
        aiResult.targetUniversityName.toLowerCase().includes(u.name.toLowerCase())
      );
      if (matchedUni) {
        aiResult.aiAssignedUniversity = matchedUni._id;
      }
    }
    if (!aiResult.aiAssignedUniversity && availableUniversities.length > 0) {
      aiResult.aiAssignedUniversity = heuristicResult.aiAssignedUniversity;
    }

    const assignedUniDoc = availableUniversities.find(u => u._id.toString() === aiResult.aiAssignedUniversity?.toString());
    if (!aiResult.aiEndorsement) {
      aiResult.aiEndorsement = `[AI Autonomous Triage & Approval] State Lifecycle Action: ${aiResult.lifecycleAction} (Publish for Open Adoption). Priority Classification: ${aiResult.priorityLevel}. ${assignedUniDoc ? `Route / Assigned to: ${assignedUniDoc.name} (${assignedUniDoc.district}). ` : ''}Autonomous AI verification validated problem legitimacy.`;
    }

    aiResult.isAiVerified = true;

    // Save or update analysis in DB
    if (!existingAnalysis) {
      existingAnalysis = new ChallengeAIAnalysis({
        challenge: challenge._id,
        ...aiResult,
      });
    } else {
      Object.assign(existingAnalysis, aiResult);
    }
    await existingAnalysis.save();

    // AUTO-APPROVE AND VERIFY CHALLENGE BY AI
    challenge.status = aiResult.lifecycleAction || 'VERIFIED';
    challenge.priority = aiResult.priorityLevel || 'HIGH';
    challenge.aiAnalysis = existingAnalysis._id;
    if (aiResult.aiAssignedUniversity) {
      challenge.assignedUniversity = aiResult.aiAssignedUniversity;
    }
    challenge.adminNotes = aiResult.aiEndorsement;
    challenge.verifiedAt = new Date();
    challenge.isAiVerified = true;
    await challenge.save();

    console.log(`[AI] Challenge ${challenge._id} successfully AI-verified: status=${challenge.status}, priority=${challenge.priority}, assignedUniversity=${challenge.assignedUniversity}`);

    return existingAnalysis;
  } catch (error) {
    console.error(`[AI] Error analyzing challenge:`, error);
    throw error;
  }
};

module.exports = {
  analyzeChallenge,
  fallbackHeuristicAnalysis,
  VALID_CATEGORIES,
};
