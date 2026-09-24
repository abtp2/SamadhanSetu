const express = require('express');
const router = express.Router();
const {
  createChallenge,
  getAllChallenges,
  getChallengeById,
  getMyChallenges,
  triggerAIAnalysis,
  updateChallengeStatus,
  getMetadata,
} = require('../controllers/challengeController');
const { authenticateJWT, optionalAuth, requireRoles } = require('../middleware/auth');

router.get('/metadata', getMetadata);
router.get('/my', optionalAuth, getMyChallenges);
router.get('/', getAllChallenges);
router.get('/:id', getChallengeById);
router.post('/', optionalAuth, createChallenge);
router.post('/:id/analyze', authenticateJWT, triggerAIAnalysis);
router.patch('/:id/status', authenticateJWT, updateChallengeStatus);

module.exports = router;
