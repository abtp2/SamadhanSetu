const express = require('express');
const router = express.Router();
const {
  adoptChallenge,
  getAllProjects,
  getProjectById,
  getMyProjects,
  addMilestone,
  submitMilestoneProof,
  verifyMilestone,
  addTeamMember,
} = require('../controllers/projectController');
const { authenticateJWT, requireRoles } = require('../middleware/auth');

router.get('/my', authenticateJWT, getMyProjects);
router.get('/', getAllProjects);
router.get('/:id', getProjectById);
router.post('/adopt', authenticateJWT, requireRoles('university', 'admin'), adoptChallenge);
router.post('/:id/milestones', authenticateJWT, requireRoles('university', 'admin'), addMilestone);
router.patch('/:id/milestones/:milestoneId/submit', authenticateJWT, submitMilestoneProof);
router.patch('/:id/milestones/:milestoneId/verify', authenticateJWT, requireRoles('university', 'admin'), verifyMilestone);
router.post('/:id/team-members', authenticateJWT, requireRoles('university', 'admin'), addTeamMember);

module.exports = router;
